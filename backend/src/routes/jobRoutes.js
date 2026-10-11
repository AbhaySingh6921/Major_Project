const express = require("express");
const multer = require("multer");

const path = require("path");

const Job = require("../models/Job");
const SubJob = require("../models/SubJob");
const splitDataset = require("../services/splitDataset");
const hashFile = require("../utils/hashFile");
const generateExpectedOutputHash = require("../utils/generateExpectedOutput");

const { createBlockchainJob } = require("../services/blockchainService");
const {
  aggregateJobResults,
  getFinalResultFile,
} = require("../services/aggregationService");

const router = express.Router();

// ============================================================
// FILE UPLOAD CONFIG
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/original");
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const isCSV =
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// ============================================================
// CREATE JOB
// ============================================================

router.post("/upload", upload.single("dataset"), async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. Validate uploaded file
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        message: "Dataset file is required",
      });
    }

    // --------------------------------------------------
    // 2. Read request data
    // --------------------------------------------------

    const { walletAddress, reward, deadline } = req.body;

    // --------------------------------------------------
    // 3. Validate request
    // --------------------------------------------------

    if (!walletAddress || !reward || !deadline) {
      return res.status(400).json({
        message: "walletAddress, reward and deadline are required",
      });
    }

    // --------------------------------------------------
    // 4. Validate reward
    // --------------------------------------------------

    const totalReward = Number(reward);

    if (totalReward <= 0) {
      return res.status(400).json({
        message: "Reward must be greater than 0",
      });
    }

    if (totalReward % 5 !== 0) {
      return res.status(400).json({
        message: "Reward must be divisible by 5",
      });
    }

    // --------------------------------------------------
    // 5. Calculate reward per SubJob
    // --------------------------------------------------

    const subJobReward = totalReward / 5;

    // --------------------------------------------------
    // 6. Create parent MongoDB Job
    // --------------------------------------------------

    const job = await Job.create({
      requester: walletAddress,

      datasetName: req.file.originalname,

      datasetPath: req.file.path,

      reward: totalReward.toString(),

      deadline: new Date(deadline),

      totalChunks: 5,

      status: "UPLOADED",
    });

    // --------------------------------------------------
    // 7. Split dataset
    // --------------------------------------------------

    const chunks = await splitDataset(req.file.path, job._id);

    // --------------------------------------------------
    // 8. Update MongoDB Job
    // --------------------------------------------------

    job.status = "SPLIT";

    job.totalChunks = chunks.length;

    await job.save();

    // --------------------------------------------------
    // 9. Create MongoDB SubJobs
    // --------------------------------------------------

    const subJobs = await Promise.all(
      chunks.map(async (chunk) => {
        // Calculate input hash
        const inputHash = await hashFile(chunk.path);

        // Calculate expected output hash
        // Generate expected output and calculate its hash
        const expectedOutputPath = path.join(
          "outputs",
          "expected",
          job._id.toString(),
          `chunk-${chunk.chunkIndex}-expected.csv`,
        );

        const expectedOutputHash = await generateExpectedOutputHash(
          chunk.path,
          expectedOutputPath,
        );

        return SubJob.create({
          jobId: job._id,

          // Will be updated after
          // blockchain job creation
          blockchainJobId: 0,

          subJobId: chunk.chunkIndex,

          chunkIndex: chunk.chunkIndex,

          chunkPath: chunk.path,

          inputHash: inputHash,

          expectedOutputHash: expectedOutputHash,

          reward: subJobReward.toString(),

          status: "OPEN",
        });
      }),
    );

    console.log(`Created ${subJobs.length} MongoDB SubJobs`);

    // --------------------------------------------------
    // 10. Prepare hashes for blockchain
    // --------------------------------------------------

    const inputHashes = subJobs
      .sort((a, b) => a.subJobId - b.subJobId)
      .map((subJob) => subJob.inputHash);

    const expectedOutputHashes = subJobs
      .sort((a, b) => a.subJobId - b.subJobId)
      .map((subJob) => subJob.expectedOutputHash);

    console.log("Input hashes:", inputHashes);

    console.log("Expected output hashes:", expectedOutputHashes);

    // --------------------------------------------------
    // 11. Create Job on Blockchain
    // --------------------------------------------------

    console.log("Creating job on blockchain...");

    const blockchainResult = await createBlockchainJob({
      datasetName: req.file.originalname,

      reward: totalReward.toString(),

      deadline: deadline,

      inputHashes: inputHashes,

      expectedOutputHashes: expectedOutputHashes,
    });

    console.log("Blockchain Job ID:", blockchainResult.blockchainJobId);

    console.log("Blockchain transaction:", blockchainResult.transactionHash);

    // --------------------------------------------------
    // 12. Save blockchain Job ID in MongoDB
    // --------------------------------------------------

    job.blockchainJobId = blockchainResult.blockchainJobId;

    job.status = "OPEN";

    await job.save();

    // --------------------------------------------------
    // 13. Update all MongoDB SubJobs
    // --------------------------------------------------

    await SubJob.updateMany(
      {
        jobId: job._id,
      },

      {
        $set: {
          blockchainJobId: blockchainResult.blockchainJobId,
        },
      },
    );

    // --------------------------------------------------
    // 14. Return response
    // --------------------------------------------------

    res.status(201).json({
      message: "Job created successfully on MongoDB and blockchain",

      job: {
        id: job._id,

        blockchainJobId: job.blockchainJobId,

        requester: job.requester,

        datasetName: job.datasetName,

        totalChunks: job.totalChunks,

        reward: job.reward,

        status: job.status,
      },

      blockchain: {
        transactionHash: blockchainResult.transactionHash,

        blockNumber: blockchainResult.blockNumber,

        blockchainJobId: blockchainResult.blockchainJobId,
      },

      subJobs: subJobs.map((subJob) => ({
        id: subJob._id,

        blockchainJobId: blockchainResult.blockchainJobId,

        subJobId: subJob.subJobId,

        chunkIndex: subJob.chunkIndex,

        chunkPath: subJob.chunkPath,

        reward: subJob.reward,

        status: subJob.status,
      })),
    });
  } catch (error) {
    console.error("Job creation error:", error);

    res.status(500).json({
      message: "Failed to create job",

      error: error.message,
    });
  }
});

// ============================================================
// DOWNLOAD SUBJOB CHUNK
// ============================================================

router.get("/:jobId/subjobs/:subJobId/chunk", async (req, res) => {
  try {
    const { jobId, subJobId } = req.params;

    // --------------------------------------------------
    // 1. Find SubJob
    // --------------------------------------------------

    const subJob = await SubJob.findOne({
      jobId: jobId,
      subJobId: Number(subJobId),
    });

    if (!subJob) {
      return res.status(404).json({
        message: "SubJob not found",
      });
    }

    // --------------------------------------------------
    // 2. Check chunk path
    // --------------------------------------------------

    if (!subJob.chunkPath) {
      return res.status(404).json({
        message: "Chunk file path not found",
      });
    }

    // --------------------------------------------------
    // 3. Resolve absolute path
    // --------------------------------------------------

    const filePath = path.resolve(
      process.cwd(),
      subJob.chunkPath
    );

    // --------------------------------------------------
    // 4. Check file exists
    // --------------------------------------------------

    const fs = require("fs");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Chunk file does not exist",
      });
    }

    // --------------------------------------------------
    // 5. Send chunk
    // --------------------------------------------------

    res.download(
      filePath,
      `job-${jobId}-chunk-${subJobId}.csv`,
      (error) => {
        if (error) {
          console.error(
            "Chunk download error:",
            error
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Download chunk error:",
      error
    );

    res.status(500).json({
      message: "Failed to download chunk",
      error: error.message,
    });
  }
});

// ============================================================
// PREPARE JOB
// ============================================================

router.get("/:jobId/prepare", async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const subJobs = await SubJob.find({
      jobId: job._id,
    })
      .sort({
        subJobId: 1,
      })
      .lean();

    if (subJobs.length !== 5) {
      return res.status(400).json({
        message: "Job must contain exactly 5 subjobs",
      });
    }

    const inputHashes = subJobs.map((subJob) => subJob.inputHash);

    const expectedOutputHashes = subJobs.map(
      (subJob) => subJob.expectedOutputHash,
    );

    res.json({
      jobId: job._id,

      blockchainJobId: job.blockchainJobId,

      totalReward: job.reward,

      inputHashes,

      expectedOutputHashes,

      subJobs: subJobs.map((subJob) => ({
        subJobId: subJob.subJobId,

        chunkIndex: subJob.chunkIndex,

        blockchainJobId: subJob.blockchainJobId,

        reward: subJob.reward,

        status: subJob.status,
      })),
    });
  } catch (error) {
    console.error("Prepare job error:", error);

    res.status(500).json({
      message: "Failed to prepare job",
    });
  }
});



router.post("/:jobId/aggregate", async (req, res) => {
  try {
    const result = await aggregateJobResults(req.params.jobId);

    res.status(200).json({
      message: "Job results aggregated and verified successfully",
      jobId: result.mongoJobId,
      blockchainJobId: result.blockchainJobId,
      totalSubJobs: result.totalSubJobs,
      finalResultHash: result.finalResultHash,
      stats: result.stats,
      downloadUrl: `/api/jobs/${result.mongoJobId}/final-result`,
    });
  } catch (error) {
    console.error("Aggregation failed:", error.message);

    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to aggregate job results",
    });
  }
});

router.get("/:jobId/final-result", async (req, res) => {
  try {
    const { job, finalPath } = await getFinalResultFile(
      req.params.jobId
    );

    res.download(
      finalPath,
      `job-${job.blockchainJobId}-final-result.csv`,
      (error) => {
        if (error) {
          console.error("Final result download failed:", error.message);
        }
      }
    );
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to download final result",
    });
  }
});


module.exports = router;
