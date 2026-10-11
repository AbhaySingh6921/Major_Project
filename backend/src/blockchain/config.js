require("dotenv").config();

const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL
);

const COMPUTE_MARKETPLACE_ADDRESS =
    process.env.COMPUTE_MARKETPLACE_ADDRESS;

module.exports = {
    provider,
    COMPUTE_MARKETPLACE_ADDRESS,
};