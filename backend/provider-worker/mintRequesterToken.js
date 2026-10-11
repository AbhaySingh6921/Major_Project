require("dotenv").config();

const { ethers } = require("ethers");
const { provider } = require("../src/blockchain/config");

const TOKEN_ADDRESS =
    "0xCdBC74a66a52FFFAEEE9BBE60D8D3004623931C0";

const REQUESTER_ADDRESS =
    "0x84725b32305881adF574B72C4D0E7f24F9904e5C";

const tokenABI = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

const token = new ethers.Contract(
    TOKEN_ADDRESS,
    tokenABI,
    wallet
);

async function main() {
    const decimals = await token.decimals();

    const amount = ethers.parseUnits("100000", decimals);

    console.log("Minting 100 tokens...");
    console.log("To:", REQUESTER_ADDRESS);

    const tx = await token.mint(
        REQUESTER_ADDRESS,
        amount
    );

    console.log("Transaction:", tx.hash);

    const receipt = await tx.wait();

    console.log(
        "Mint confirmed in block:",
        receipt.blockNumber
    );

    const balance =
        await token.balanceOf(REQUESTER_ADDRESS);

    console.log(
        "Requester balance:",
        ethers.formatUnits(balance, decimals)
    );
}

main().catch((error) => {
    console.error("Mint failed:");
    console.error(error);
});