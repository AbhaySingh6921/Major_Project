require("dotenv").config();

const { ethers } = require("ethers");

const { provider } = require("../src/blockchain/config");

const TOKEN_ADDRESS =
    "0xCdBC74a66a52FFFAEEE9BBE60D8D3004623931C0";

const TOKEN_ABI = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const deployerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

const token = new ethers.Contract(
    TOKEN_ADDRESS,
    TOKEN_ABI,
    deployerWallet
);

const PROVIDER_ADDRESS =
    "0x13f10a0f3d69035f335359c7Ec3f0cab866B924b";

async function main() {
    const decimals = await token.decimals();

    const amount = ethers.parseUnits("100", decimals);

    console.log("Minting 100 tokens...");
    console.log("To:", PROVIDER_ADDRESS);

    const tx = await token.mint(
        PROVIDER_ADDRESS,
        amount
    );

    console.log("Transaction:", tx.hash);

    const receipt = await tx.wait();

    console.log(
        "Mint confirmed in block:",
        receipt.blockNumber
    );

    const balance =
        await token.balanceOf(PROVIDER_ADDRESS);

    console.log(
        "Provider token balance:",
        ethers.formatUnits(balance, decimals)
    );
}

main().catch((error) => {
    console.error("Mint failed:");
    console.error(error);
});