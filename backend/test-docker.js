const path = require("path");
const fs = require("fs");

const {
    executeInDocker,
} = require("./src/services/dockerExecutor");

async function main() {

    const inputFile = path.resolve(
        "uploads/chunks/6ac4b2697d0e03213322c478/chunk-0.csv"
    );

    const outputFile = path.resolve(
        "outputs/docker-test-output.csv"
    );

    console.log("Input:", inputFile);
    console.log("Output:", outputFile);

    await executeInDocker({
        inputFile,
        outputFile,
    });

    console.log("\nDocker test successful.");

    console.log(
        "Output exists:",
        fs.existsSync(outputFile)
    );
}

main().catch((error) => {

    console.error("\nDocker test failed:");
    console.error(error);

    process.exit(1);
});
