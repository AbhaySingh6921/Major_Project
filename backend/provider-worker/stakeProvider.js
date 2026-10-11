require("dotenv").config();

const { ethers } = require("ethers");

const { provider } = require("../src/blockchain/config");

const TOKEN_ADDRESS =
    "0xCdBC74a66a52FFFAEEE9BBE60D8D3004623931C0";

const REGISTRY_ADDRESS =
    "0x06AaCE7806805bf30e646Bc845D56E646168692C";

const PROVIDER_ADDRESS =
    "0x13f10a0f3d69035f335359c7Ec3f0cab866B924b";

const tokenABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)"
];

const registryABI = [
    "function stake(uint256 amount) external",
    "function getStake(address provider) view returns (uint256)"
];

const providerWallet = new ethers.Wallet(
    process.env.PROVIDER_PRIVATE_KEY,
    provider
);

const token = new ethers.Contract(
    TOKEN_ADDRESS,
    tokenABI,
    providerWallet
);

const registry = new ethers.Contract(
    REGISTRY_ADDRESS,
    registryABI,
    providerWallet
);

async function main() {
    const amount = ethers.parseUnits("20", 18);

    console.log("Provider:", providerWallet.address);

    const balance =
        await token.balanceOf(PROVIDER_ADDRESS);

    console.log(
        "Token balance:",
        ethers.formatUnits(balance, 18)
    );

    console.log("Approving 20 tokens...");

    const approveTx = await token.approve(
        REGISTRY_ADDRESS,
        amount
    );

    console.log("Approval transaction:", approveTx.hash);

    await approveTx.wait();

    console.log("Approval confirmed.");

    console.log("Staking 20 tokens...");

    const stakeTx = await registry.stake(amount);

    console.log("Stake transaction:", stakeTx.hash);

    const receipt = await stakeTx.wait();

    console.log(
        "Stake confirmed in block:",
        receipt.blockNumber
    );

    const stake =
        await registry.getStake(PROVIDER_ADDRESS);

    console.log(
        "Provider stake:",
        ethers.formatUnits(stake, 18)
    );
}

main().catch((error) => {
    console.error("Staking failed:");
    console.error(error);
});