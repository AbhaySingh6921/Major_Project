const { ethers } = require("ethers");

const {
    provider,
    COMPUTE_MARKETPLACE_ADDRESS
} = require("../blockchain/config");

const marketplaceABI =
    require("../blockchain/ComputeMarketplace.json").abi;

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

const marketplace = new ethers.Contract(
    COMPUTE_MARKETPLACE_ADDRESS,
    marketplaceABI,
    wallet
);

// Read next blockchain job ID
async function getNextJobId() {
    return await marketplace.nextJobId();
}

// Read blockchain subjob
async function getSubJob(jobId, subJobId) {
    return await marketplace.subJobs(jobId, subJobId);
}

// Create job on blockchain
async function createBlockchainJob({
    datasetName,
    reward,
    deadline,
    inputHashes,
    expectedOutputHashes
}) {
    if (inputHashes.length !== 5) {
        throw new Error("Exactly 5 input hashes are required");
    }

    if (expectedOutputHashes.length !== 5) {
        throw new Error("Exactly 5 expected output hashes are required");
    }

    const tx = await marketplace.createJob(
        datasetName,
        ethers.parseUnits(reward, 18),
        Math.floor(new Date(deadline).getTime() / 1000),
        inputHashes,
        expectedOutputHashes
    );

    console.log("Blockchain createJob transaction:", tx.hash);

    const receipt = await tx.wait();

    console.log(
        "Blockchain createJob confirmed in block:",
        receipt.blockNumber
    );

    /*
     * nextJobId is incremented after creation.
     * Therefore the created job ID is nextJobId - 1.
     */
    const nextId = await marketplace.nextJobId();

    return {
        blockchainJobId: Number(nextId) - 1,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
    };
}

module.exports = {
    getNextJobId,
    getSubJob,
    createBlockchainJob
};