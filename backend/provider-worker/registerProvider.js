require("dotenv").config();

const { ethers } = require("ethers");

const { provider } = require("../src/blockchain/config");

const providerRegistryABI = [
    "function registerProvider(string calldata metadataURI) external",
    "function isProvider(address provider) external view returns (bool)"
];

const PROVIDER_REGISTRY_ADDRESS =
    "0x06AaCE7806805bf30e646Bc845D56E646168692C";

const providerWallet = new ethers.Wallet(
    process.env.PROVIDER_PRIVATE_KEY,
    provider
);

const registry = new ethers.Contract(
    PROVIDER_REGISTRY_ADDRESS,
    providerRegistryABI,
    providerWallet
);

async function main() {
    console.log("Provider:", providerWallet.address);

    const alreadyRegistered =
        await registry.isProvider(providerWallet.address);

    if (alreadyRegistered) {
        console.log("Provider is already registered.");
        return;
    }

    console.log("Registering provider...");

    const tx = await registry.registerProvider(
        "provider-test-1"
    );

    console.log("Transaction:", tx.hash);

    const receipt = await tx.wait();

    console.log(
        "Registration confirmed in block:",
        receipt.blockNumber
    );

    const registered =
        await registry.isProvider(providerWallet.address);

    console.log("Registered:", registered);
}

main().catch((error) => {
    console.error("Provider registration failed:");
    console.error(error);
});