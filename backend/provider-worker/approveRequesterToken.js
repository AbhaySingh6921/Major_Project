require("dotenv").config();

const { ethers } = require("ethers");
const { provider } = require("../src/blockchain/config");

const TOKEN_ADDRESS =
    "0xCdBC74a66a52FFFAEEE9BBE60D8D3004623931C0";

const MARKETPLACE_ADDRESS =
    process.env.COMPUTE_MARKETPLACE_ADDRESS;

const tokenABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
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

    console.log("Requester:", wallet.address);
    console.log("Marketplace:", MARKETPLACE_ADDRESS);
    console.log("Approving 100 tokens...");

    const tx = await token.approve(
        MARKETPLACE_ADDRESS,
        amount
    );

    console.log("Approval transaction:", tx.hash);

    const receipt = await tx.wait();

    console.log(
        "Approval confirmed in block:",
        receipt.blockNumber
    );

    const allowance =
        await token.allowance(
            wallet.address,
            MARKETPLACE_ADDRESS
        );

    console.log(
        "Allowance:",
        ethers.formatUnits(allowance, decimals)
    );
}

main().catch((error) => {
    console.error("Approval failed:");
    console.error(error);
});