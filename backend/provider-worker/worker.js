require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const axios = require("axios");

const {
  provider,
  COMPUTE_MARKETPLACE_ADDRESS,
} = require("../src/blockchain/config");

const hashFile = require("../src/utils/hashFile");
const providerService = require("../src/services/providerService");

const { executeInDocker } = require("../src/services/dockerExecutor");

const SubJob = require("../src/models/SubJob");
const Job = require("../src/models/Job");

const marketplaceABI = require("../src/blockchain/ComputeMarketplace.json").abi;

const providerKey =
  process.env.WORKER_PRIVATE_KEY || process.env.PROVIDER_PRIVATE_KEY;

if (!providerKey) {
  throw new Error(
    "Set WORKER_PRIVATE_KEY or PROVIDER_PRIVATE_KEY in the environment",
  );
}

const providerWallet = new ethers.Wallet(providerKey, provider);

const marketplace = new ethers.Contract(
  COMPUTE_MARKETPLACE_ADDRESS,
  marketplaceABI,
  providerWallet,
);

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const PROVIDER_INPUT_DIRECTORY = path.resolve(
  process.cwd(),
  "provider-data",
  "inputs",
);

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("=================================");
  console.log("Provider Worker");
  console.log("=================================");

  console.log("Provider wallet:", providerWallet.address);

  // ========================================================
  // 1. Connect MongoDB
  // ========================================================

  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB connected");

  // ========================================================
  // 2. Find MongoDB OPEN SubJobs
  // ========================================================

  const openSubJobs = await providerService.getOpenSubJobs();

  // Find accepted subjobs that belong to this provider.
  const acceptedSubJobs = await SubJob.find({
    status: "ACCEPTED",
  }).sort({ createdAt: -1 });

  const myAcceptedSubJobs = acceptedSubJobs.filter(
    (item) =>
      String(item.provider || "").toLowerCase() ===
      providerWallet.address.toLowerCase(),
  );

  const targetJobId = process.env.TARGET_BLOCKCHAIN_JOB_ID;

  // Prioritize resuming accepted jobs before accepting new jobs.
  const candidates = [...myAcceptedSubJobs, ...openSubJobs].filter(
    (item) =>
      !targetJobId || String(item.blockchainJobId) === String(targetJobId),
  );

  console.log(`Found ${openSubJobs.length} open SubJob(s).`);
  console.log(
    `Found ${myAcceptedSubJobs.length} accepted SubJob(s) assigned to this provider.`,
  );

  if (candidates.length === 0) {
    console.log("No eligible SubJobs available for this provider.");
    return;
  }

  if (openSubJobs.length === 0) {
    console.log("No open SubJobs available.");

    return;
  }

  // ========================================================
  // 3. Find a SubJob that is actually OPEN on blockchain
  // ========================================================

  let subJob = null;
  let blockchainSubJob = null;

  for (const candidate of candidates) {
    const candidateJobId = Number(candidate.blockchainJobId);

    const candidateSubJobId = Number(candidate.subJobId);

    try {
      const onChainSubJob = await marketplace.subJobs(
        candidateJobId,
        candidateSubJobId,
      );

      /*
       * ComputeMarketplace SubJob getter:
       *
       * [0] subJobId
       * [1] jobId
       * [2] chunkIndex
       * [3] provider
       * [4] reward
       * [5] inputHash
       * [6] expectedOutputHash
       * [7] outputHash
       * [8] status
       */

      const status = Number(onChainSubJob[8]);

      console.log(
        `Checking MongoDB SubJob ${candidate._id} -> ` +
          `Blockchain Job ${candidateJobId}/SubJob ${candidateSubJobId}, ` +
          `status=${status}`,
      );

      // 0 = OPEN

      const assignedProvider = String(onChainSubJob[3]).toLowerCase();

      const isOpen = status === 0;

      const isAcceptedByThisProvider =
        status === 1 &&
        assignedProvider === providerWallet.address.toLowerCase();

      if (isOpen || isAcceptedByThisProvider) {
        subJob = candidate;
        blockchainSubJob = onChainSubJob;
        break;
      }
    } catch (error) {
      console.log(
        `Skipping invalid Blockchain Job ` +
          `${candidateJobId}/SubJob ${candidateSubJobId}`,
      );
    }
  }

  if (!subJob) {
    console.log("No MongoDB OPEN SubJob has an OPEN blockchain SubJob.");

    return;
  }

  // ========================================================
  // 4. Selected SubJob
  // ========================================================

  const jobId = Number(subJob.blockchainJobId);

  const subJobId = Number(subJob.subJobId);

  console.log("\nSelected SubJob:");

  console.log("MongoDB ID:", subJob._id.toString());

  console.log("Blockchain Job ID:", jobId);

  console.log("SubJob ID:", subJobId);

  console.log("Chunk:", subJob.chunkIndex);

  console.log("Reward:", subJob.reward);

  console.log("\nBlockchain SubJob:");

  console.log("Provider:", blockchainSubJob[3]);

  console.log("Status:", Number(blockchainSubJob[8]));

  console.log("Input Hash:", blockchainSubJob[5]);

  console.log("Expected Output Hash:", blockchainSubJob[6]);

  // ========================================================
  // 5. Accept SubJob
  // ========================================================

  
const currentStatus = Number(blockchainSubJob[8]);

if (currentStatus === 0) {
  console.log(`\nAccepting Job ${jobId}, SubJob ${subJobId}...`);

  const acceptTx = await marketplace.acceptSubJob(jobId, subJobId);

  console.log("Accept transaction:", acceptTx.hash);

  const acceptReceipt = await acceptTx.wait();

  console.log("Accepted in block:", acceptReceipt.blockNumber);
} else if (
  currentStatus === 1 &&
  String(blockchainSubJob[3]).toLowerCase() ===
    providerWallet.address.toLowerCase()
) {
  console.log(
    `\nResuming Job ${jobId}, SubJob ${subJobId}; ` +
    "already accepted by this provider."
  );
} else {
  throw new Error(
    "SubJob is not OPEN or is not assigned to this provider."
  );
}

await SubJob.findByIdAndUpdate(subJob._id, {
  provider: providerWallet.address.toLowerCase(),
  status: "ACCEPTED",
});

console.log("MongoDB SubJob updated: ACCEPTED");

  // ========================================================
  // 7. Download chunk from Backend
  // ========================================================

  fs.mkdirSync(PROVIDER_INPUT_DIRECTORY, {
    recursive: true,
  });

  const filePath = path.join(
    PROVIDER_INPUT_DIRECTORY,
    `job-${jobId}-subjob-${subJobId}.csv`,
  );

  const chunkUrl =
    `${BACKEND_URL}/api/jobs/` +
    `${subJob.jobId}/` +
    `subjobs/${subJobId}/chunk`;

  console.log("\nDownloading input chunk...");

  console.log("Backend URL:", chunkUrl);

  const response = await axios({
    method: "GET",
    url: chunkUrl,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);

    response.data.on("error", reject);
  });

  console.log("Chunk downloaded successfully.");

  console.log("Local provider file:", filePath);
  // ========================================================
  // 8. Verify input hash
  // ========================================================

  const inputHash = await hashFile(filePath);

  console.log("\nCalculated input hash:", inputHash);

  console.log("MongoDB input hash:", subJob.inputHash);

  console.log("Blockchain input hash:", blockchainSubJob[5]);

  if (inputHash.toLowerCase() !== subJob.inputHash.toLowerCase()) {
    throw new Error("Input hash does not match MongoDB");
  }

  if (inputHash.toLowerCase() !== blockchainSubJob[5].toLowerCase()) {
    throw new Error("Input hash does not match blockchain");
  }

  console.log("Input hash verified.");

  // ========================================================
  // 9. COMPUTATION
  // ========================================================
  //
  // Temporary deterministic computation:
  //
  // input chunk -> output chunk
  //
  // Later this will be replaced with Docker execution.
  // ========================================================

  const outputDirectory = path.resolve(process.cwd(), "outputs");

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  const outputFile = path.join(
    outputDirectory,
    `job-${jobId}-subjob-${subJobId}-output.csv`,
  );

  await executeInDocker({
    inputFile: filePath,
    outputFile: outputFile,
  });

  console.log("\nComputation completed inside Docker.");

  console.log("Output:", outputFile);
  // ========================================================
  // 10. Calculate output hash
  // ========================================================

  const outputHash = await hashFile(outputFile);

  console.log("\nOutput hash:", outputHash);

  // ========================================================
  // 11. Verify expected output hash
  // ========================================================

  const expectedOutputHash = subJob.expectedOutputHash;

  const blockchainExpectedOutputHash = blockchainSubJob[6];

  console.log(
    "MongoDB expected output hash:",
    expectedOutputHash || "NOT AVAILABLE",
  );

  console.log("Blockchain expected output hash:", blockchainExpectedOutputHash);

  if (!blockchainExpectedOutputHash) {
    throw new Error("Blockchain expectedOutputHash is missing");
  }

  // --------------------------------------------------------
  // Verify MongoDB hash if available
  // --------------------------------------------------------

  if (expectedOutputHash) {
    if (outputHash.toLowerCase() !== expectedOutputHash.toLowerCase()) {
      throw new Error(
        "Output hash does not match MongoDB expected output hash",
      );
    }

    console.log("Output hash verified against MongoDB.");
  } else {
    console.log(
      "MongoDB expectedOutputHash is missing. " +
        "Skipping MongoDB hash verification.",
    );
  }

  // --------------------------------------------------------
  // Verify blockchain hash
  // --------------------------------------------------------

  if (outputHash.toLowerCase() !== blockchainExpectedOutputHash.toLowerCase()) {
    throw new Error(
      "Output hash does not match blockchain expected output hash",
    );
  }

  console.log("Output hash verified against blockchain.");

  // ========================================================
  // 12. Submit result
  // ========================================================

  console.log("\nSubmitting result...");

  const resultTx = await marketplace.submitSubJobResult(
    jobId,
    subJobId,
    outputHash,
  );

  console.log("Result transaction:", resultTx.hash);

  const resultReceipt = await resultTx.wait();

  console.log("Result confirmed in block:", resultReceipt.blockNumber);

  // ========================================================
  // 13. Update MongoDB SubJob
  // ========================================================

  await SubJob.findByIdAndUpdate(subJob._id, {
    status: "COMPLETED",
    outputPath: outputFile,
    outputHash: outputHash,
  });

  console.log("MongoDB SubJob updated: COMPLETED");

  // ========================================================
  // 14. Update parent Job status
  // ========================================================

  const allSubJobs = await SubJob.find({
    jobId: subJob.jobId,
  });

  const allCompleted =
    allSubJobs.length > 0 &&
    allSubJobs.every((item) => item.status === "COMPLETED");

  if (allCompleted) {
    await Job.findByIdAndUpdate(subJob.jobId, {
      status: "COMPLETED",
    });

    console.log("MongoDB Job updated: COMPLETED");
  } else {
    await Job.findByIdAndUpdate(subJob.jobId, {
      status: "IN_PROGRESS",
    });

    console.log("MongoDB Job updated: IN_PROGRESS");
  }

  // ========================================================
  // 15. Verify final blockchain state
  // ========================================================

  const finalSubJob = await marketplace.subJobs(jobId, subJobId);

  console.log("\n=================================");

  console.log("FINAL RESULT");

  console.log("=================================");

  console.log("SubJob ID:", finalSubJob[0].toString());

  console.log("Job ID:", finalSubJob[1].toString());

  console.log("Provider:", finalSubJob[3]);

  console.log("Input hash:", finalSubJob[5]);

  console.log("Expected output hash:", finalSubJob[6]);

  console.log("Output hash:", finalSubJob[7]);

  console.log("Status:", finalSubJob[8].toString());

  console.log("=================================");
}

// ============================================================
// ERROR HANDLING
// ============================================================

main()
  .catch((error) => {
    console.error("\nProvider worker failed:");

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (error) {
      // Ignore disconnect error
    }
  });
