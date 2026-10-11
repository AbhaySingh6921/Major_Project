const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const {
    provider,
    COMPUTE_MARKETPLACE_ADDRESS,
} = require("./config");

const artifactPath = path.join(
    __dirname,
    "ComputeMarketplace.json"
);

const artifact = JSON.parse(
    fs.readFileSync(artifactPath, "utf8")
);

const contract = new ethers.Contract(
    COMPUTE_MARKETPLACE_ADDRESS,
    artifact.abi,
    provider
);

const getNextJobId = async () => {
    const jobId = await contract.nextJobId();
    return Number(jobId);
};

const getJob = async (jobId) => {
    const job = await contract.jobs(jobId);

    return {
        jobId: Number(job.jobId),
        requester: job.requester,
        provider: job.provider,
        reward: job.reward.toString(),
        inputHash: job.inputHash,
        expectedOutputHash: job.expectedOutputHash,
        outputHash: job.outputHash,
        deadline: Number(job.deadline),
        status: Number(job.status),
    };
};

module.exports = {
    contract,
    getNextJobId,
    getJob,
};