
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const Job = require("../models/Job");
const SubJob = require("../models/SubJob");
const hashFile = require("../utils/hashFile");

const {
  provider,
  COMPUTE_MARKETPLACE_ADDRESS,
} = require("../blockchain/config");

const marketplaceABI =
  require("../blockchain/ComputeMarketplace.json").abi;

const marketplace = new ethers.Contract(
  COMPUTE_MARKETPLACE_ADDRESS,
  marketplaceABI,
  provider
);

const OUTPUT_DIRECTORY = path.resolve(process.cwd(), "outputs");

function getFinalResultPath(job) {
  return path.join(
    OUTPUT_DIRECTORY,
    `job-${job.blockchainJobId}-final-result.csv`
  );
}

function parseStatsFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8").trim();
  const lines = content.split(/\r?\n/);

  if (lines.shift()?.trim() !== "metric,value") {
    throw new Error(`Invalid CSV_STATS output format: ${filePath}`);
  }

  const stats = {};

  for (const line of lines) {
    if (!line.trim()) continue;

    const separator = line.indexOf(",");

    if (separator === -1) {
      throw new Error(`Invalid statistics row in ${filePath}: ${line}`);
    }

    const metric = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = Number(rawValue);

    if (!metric || !Number.isFinite(value)) {
      throw new Error(`Invalid statistics value in ${filePath}: ${line}`);
    }

    if (Object.prototype.hasOwnProperty.call(stats, metric)) {
      throw new Error(`Duplicate metric "${metric}" in ${filePath}`);
    }

    stats[metric] = value;
  }

  const requiredMetrics = [
    "row_count",
    "total_salary",
    "average_salary",
    "minimum_salary",
    "maximum_salary",
  ];

  for (const metric of requiredMetrics) {
    if (!Object.prototype.hasOwnProperty.call(stats, metric)) {
      throw new Error(`Missing metric "${metric}" in ${filePath}`);
    }
  }

  if (
    !Number.isInteger(stats.row_count) ||
    stats.row_count < 0 ||
    !Number.isSafeInteger(stats.total_salary)
  ) {
    throw new Error(`Invalid row_count or total_salary in ${filePath}`);
  }

  if (
    stats.row_count === 0 &&
    stats.total_salary !== 0
  ) {
    throw new Error(`Inconsistent empty dataset statistics in ${filePath}`);
  }

  if (
    stats.row_count > 0 &&
    stats.minimum_salary > stats.maximum_salary
  ) {
    throw new Error(`Invalid minimum/maximum values in ${filePath}`);
  }

  return stats;
}

async function aggregateJobResults(mongoJobId) {
  const job = await Job.findById(mongoJobId);

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  if (job.status !== "COMPLETED") {
    const error = new Error(
      `Job must be COMPLETED before aggregation. Current status: ${job.status}`
    );
    error.statusCode = 409;
    throw error;
  }

  const subJobs = await SubJob.find({
    jobId: job._id,
  }).sort({ chunkIndex: 1 });

  const expectedCount = Number(job.totalChunks);

  if (
    !Number.isInteger(expectedCount) ||
    expectedCount <= 0 ||
    subJobs.length !== expectedCount
  ) {
    throw new Error(
      `Expected ${expectedCount} subjobs, but found ${subJobs.length}`
    );
  }

  // Validate every output before aggregating any statistics.
  const chunkStats = [];

  for (const subJob of subJobs) {
    if (
      subJob.status !== "COMPLETED" ||
      !subJob.outputPath ||
      !subJob.outputHash ||
      !subJob.expectedOutputHash
    ) {
      throw new Error(
        `SubJob ${subJob.subJobId} is incomplete or missing output metadata`
      );
    }

    const outputPath = path.resolve(subJob.outputPath);

    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `Output file missing for SubJob ${subJob.subJobId}: ${outputPath}`
      );
    }

    // Verify the actual output file against MongoDB.
    const actualHash = await hashFile(outputPath);

    if (
      actualHash.toLowerCase() !== subJob.outputHash.toLowerCase()
    ) {
      throw new Error(
        `Output file hash mismatch for SubJob ${subJob.subJobId}`
      );
    }

    if (
      actualHash.toLowerCase() !==
      subJob.expectedOutputHash.toLowerCase()
    ) {
      throw new Error(
        `Expected output hash mismatch for SubJob ${subJob.subJobId}`
      );
    }

    // Verify the corresponding on-chain record.
    const onChain = await marketplace.subJobs(
      Number(job.blockchainJobId),
      Number(subJob.subJobId)
    );

    const onChainStatus = Number(onChain[8]);
    const onChainExpectedHash = String(onChain[6]).toLowerCase();
    const onChainOutputHash = String(onChain[7]).toLowerCase();

    // COMPLETED=2, VERIFIED=3, SETTLED=5.
    if (![2, 3, 5].includes(onChainStatus)) {
      throw new Error(
        `Blockchain SubJob ${subJob.subJobId} is not completed successfully. Status: ${onChainStatus}`
      );
    }

    if (
      actualHash.toLowerCase() !== onChainExpectedHash ||
      actualHash.toLowerCase() !== onChainOutputHash
    ) {
      throw new Error(
        `Blockchain output hash mismatch for SubJob ${subJob.subJobId}`
      );
    }

    chunkStats.push(parseStatsFile(outputPath));
  }

  // Combine chunk statistics correctly.
  const rowCount = chunkStats.reduce(
    (sum, stats) => sum + stats.row_count,
    0
  );

  const totalSalary = chunkStats.reduce(
    (sum, stats) => sum + stats.total_salary,
    0
  );

  if (!Number.isSafeInteger(rowCount) || !Number.isSafeInteger(totalSalary)) {
    throw new Error("Aggregated totals exceed the safe integer range");
  }

  const nonEmptyChunks = chunkStats.filter(
    (stats) => stats.row_count > 0
  );

  let minimumSalary = 0;
  let maximumSalary = 0;

  if (rowCount > 0) {
    if (nonEmptyChunks.length === 0) {
      throw new Error("No non-empty chunks available for aggregation");
    }

    minimumSalary = Math.min(
      ...nonEmptyChunks.map((stats) => stats.minimum_salary)
    );

    maximumSalary = Math.max(
      ...nonEmptyChunks.map((stats) => stats.maximum_salary)
    );
  }

  const averageSalary =
    rowCount > 0
      ? Number((totalSalary / rowCount).toFixed(6))
      : 0;

  const finalCSV = [
    "metric,value",
    `row_count,${rowCount}`,
    `total_salary,${totalSalary}`,
    `average_salary,${averageSalary}`,
    `minimum_salary,${minimumSalary}`,
    `maximum_salary,${maximumSalary}`,
    "",
  ].join("\n");

  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

  const finalPath = getFinalResultPath(job);

  fs.writeFileSync(finalPath, finalCSV, "utf8");

  const finalHash = await hashFile(finalPath);

  return {
    mongoJobId: job._id.toString(),
    blockchainJobId: Number(job.blockchainJobId),
    totalSubJobs: subJobs.length,
    finalResultPath: finalPath,
    finalResultHash: finalHash,
    stats: {
      row_count: rowCount,
      total_salary: totalSalary,
      average_salary: averageSalary,
      minimum_salary: minimumSalary,
      maximum_salary: maximumSalary,
    },
  };
}

async function getFinalResultFile(mongoJobId) {
  const job = await Job.findById(mongoJobId);

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  const finalPath = getFinalResultPath(job);

  if (!fs.existsSync(finalPath)) {
    const error = new Error(
      "Final result does not exist. Aggregate the job first."
    );
    error.statusCode = 404;
    throw error;
  }

  return {
    job,
    finalPath,
  };
}

module.exports = {
  aggregateJobResults,
  getFinalResultFile,
};
