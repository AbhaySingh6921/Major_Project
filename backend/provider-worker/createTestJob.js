require("dotenv").config();

const { ethers } = require("ethers");

const {
    provider,
    COMPUTE_MARKETPLACE_ADDRESS
} = require("../src/blockchain/config");

const marketplaceABI =
    require("../src/blockchain/ComputeMarketplace.json").abi;

const marketplace = new ethers.Contract(
    COMPUTE_MARKETPLACE_ADDRESS,
    marketplaceABI,
    provider
);

async function main() {
    // --------------------------------------------------
    // 1. Provider/requester wallet
    // --------------------------------------------------

    const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider
    );

    console.log("Requester wallet:", wallet.address);

    const marketplaceWithSigner =
        marketplace.connect(wallet);

    // --------------------------------------------------
    // 2. Get the 5 hashes from your existing MongoDB data
    // --------------------------------------------------

    const inputHashes = [
        "0x7c2bcd5b69b6e410aa03a54c3eedf0a64f8bbcba80b9adeb023f4114d11cdcd4",
        "0x25427bea7375dabb7d7a182efe6e33e739609a84b1bdff79f9013e8893ebd0fa",
        "0xd5dc2d96fa351bab9c64f42f4e9fcd7b12651ef8b5f8d4ea8f75e7edacdfbcd2",
        "0xc3a42c5b6d38520f715ba4f950b9af3caa6946accb6cba897d60145a33a2c041",
        "0xb9f44ad48bd3d618ea702ba42571ac0ef82b3e45abdaf5692c16156f2645ff14"
    ];

    const expectedOutputHashes = [
        "0x7c2bcd5b69b6e410aa03a54c3eedf0a64f8bbcba80b9adeb023f4114d11cdcd4",
        "0x25427bea7375dabb7d7a182efe6e33e739609a84b1bdff79f9013e8893ebd0fa",
        "0xd5dc2d96fa351bab9c64f42f4e9fcd7b12651ef8b5f8d4ea8f75e7edacdfbcd2",
        "0xc3a42c5b6d38520f715ba4f950b9af3caa6946accb6cba897d60145a33a2c041",
        "0xb9f44ad48bd3d618ea702ba42571ac0ef82b3e45abdaf5692c16156f2645ff14"
    ];

    // --------------------------------------------------
    // 3. Create a future deadline
    // --------------------------------------------------

    const currentTime =
        Math.floor(Date.now() / 1000);

    const deadline =
        currentTime + (24 * 60 * 60);

    console.log("Current timestamp:", currentTime);
    console.log("Deadline:", deadline);

    // --------------------------------------------------
    // 4. Job reward
    // --------------------------------------------------
    // Your contract divides reward into 5 chunks.
    //
    // 100 tokens / 5 = 20 tokens per subjob
    //
    // This must match the payment token decimals.
    // --------------------------------------------------

    const reward =
        ethers.parseUnits("100", 18);

    console.log("Creating blockchain job...");
    console.log("Reward:", ethers.formatUnits(reward, 18));

    // --------------------------------------------------
    // 5. Create blockchain job
    // --------------------------------------------------

    const tx =
        await marketplaceWithSigner.createJob(
            "test-dataset",
            reward,
            deadline,
            inputHashes,
            expectedOutputHashes
        );

    console.log("Transaction:", tx.hash);

    const receipt =
        await tx.wait();

    console.log(
        "Job creation confirmed in block:",
        receipt.blockNumber
    );

    // --------------------------------------------------
    // 6. Get newly created Job ID
    // --------------------------------------------------

    const nextJobId =
        await marketplace.nextJobId();

    const jobId =
        Number(nextJobId) - 1;

    console.log("--------------------------------");
    console.log("Blockchain Job ID:", jobId);
    console.log("--------------------------------");

    // --------------------------------------------------
    // 7. Display all 5 subjobs
    // --------------------------------------------------

    for (let i = 0; i < 5; i++) {

        const subJob =
            await marketplace.subJobs(jobId, i);

        console.log(`SubJob ${i}:`);
        console.log("  Job ID:", subJob[1].toString());
        console.log("  SubJob ID:", subJob[0].toString());
        console.log("  Chunk Index:", subJob[2].toString());
        console.log("  Provider:", subJob[3]);
        console.log(
            "  Reward:",
            ethers.formatUnits(subJob[4], 18)
        );
        console.log("  Input Hash:", subJob[5]);
        console.log("  Expected Output Hash:", subJob[6]);
        console.log("  Output Hash:", subJob[7]);
        console.log("  Status:", subJob[8].toString());
        console.log("--------------------------------");
    }
}

main().catch((error) => {
    console.error("Create test job failed:");
    console.error(error);
    process.exit(1);
});