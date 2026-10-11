const SubJob = require("../models/SubJob");
const path = require("path");
const fs = require("fs");

async function getOpenSubJobs() {
    return await SubJob.find({
        status: "OPEN",
        provider: null,
        inputHash: { $ne: "PENDING" }
    }).sort({ createdAt: -1 });
}

async function getSubJobChunk(mongoId) {
    const subJob = await SubJob.findOne({
        _id: mongoId,
        status: "OPEN",
        provider: null
    });

    if (!subJob) {
        throw new Error("Open SubJob not found");
    }

    const filePath = path.resolve(process.cwd(), subJob.chunkPath);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Chunk file not found: ${filePath}`);
    }

    return {
        subJob,
        filePath
    };
}

module.exports = {
    getOpenSubJobs,
    getSubJobChunk
};