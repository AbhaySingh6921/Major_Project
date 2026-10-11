const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

function runDocker(args) {
    return new Promise((resolve, reject) => {
        execFile(
            "docker",
            args,
            {
                maxBuffer: 10 * 1024 * 1024,
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(
                        new Error(stderr || error.message)
                    );
                    return;
                }

                resolve({ stdout, stderr });
            }
        );
    });
}

async function executeInDocker({
    inputFile,
    outputFile,
}) {
    if (!fs.existsSync(inputFile)) {
        throw new Error(
            `Input file not found: ${inputFile}`
        );
    }

    const inputDirectory =
        path.dirname(path.resolve(inputFile));

    const inputFilename =
        path.basename(inputFile);

    const outputDirectory =
        path.dirname(path.resolve(outputFile));

    const outputFilename =
        path.basename(outputFile);

    fs.mkdirSync(outputDirectory, {
        recursive: true,
    });

    const dockerArgs = [
        "run",
        "--rm",

        // Network isolation
        "--network",
        "none",

        // Security
        "--security-opt",
        "no-new-privileges",

        "--cap-drop",
        "ALL",

        // Read-only container filesystem
        "--read-only",

        // Resource limits
        "--memory",
        "512m",

        "--cpus",
        "1",

        "--pids-limit",
        "64",

        // Input: read-only
        "-v",
        `${inputDirectory}:/input:ro`,

        // Output: writable
        "-v",
        `${outputDirectory}:/output:rw`,

        // Trusted computation image
        "compute-runner:1.0",

        // Program arguments
        `/input/${inputFilename}`,
        `/output/${outputFilename}`,
    ];

    console.log("\nStarting Docker computation...");

    const result = await runDocker(dockerArgs);

    console.log("Docker computation completed.");

    if (result.stdout) {
        console.log("\nDocker output:");
        console.log(result.stdout);
    }

    return result;
}

module.exports = {
    executeInDocker,
};