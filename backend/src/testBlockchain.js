const blockchainService = require("./services/blockchainService");

async function main() {
    const nextJobId =
        await blockchainService.getNextJobId();

    console.log(
        "Next Job ID:",
        nextJobId.toString()
    );

    const subJob =
        await blockchainService.getSubJob(0, 0);

    console.log("SubJob 0:", subJob);
}

main().catch((error) => {
    console.error("Blockchain test failed:", error);
});









//     getNextJobId,
// } = require("./blockchain/computeMarketplace");

// const test = async () => {
//     try {
//         const nextJobId = await getNextJobId();

//         console.log("Next Job ID:", nextJobId);
//     } catch (error) {
//         console.error(
//             "Blockchain connection failed:",
//             error.message
//         );
//     }
// };

// test();