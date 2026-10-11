const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CHUNK_COUNT = 5;

const splitDataset = async (inputPath, jobId) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(inputPath)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", () => {
                try {
                    if (rows.length === 0) {
                        return reject(
                            new Error("CSV contains no data")
                        );
                    }

                    const chunks = Array.from(
                        { length: CHUNK_COUNT },
                        () => []
                    );

                    rows.forEach((row, index) => {
                        chunks[index % CHUNK_COUNT].push(row);
                    });

                    const outputDir = path.join(
                        "uploads",
                        "chunks",
                        String(jobId)
                    );

                    fs.mkdirSync(outputDir, {
                        recursive: true,
                    });

                    const createdChunks = [];

                    chunks.forEach((chunk, index) => {
                        if (chunk.length === 0) return;

                        const filePath = path.join(
                            outputDir,
                            `chunk-${index}.csv`
                        );

                        const headers = Object.keys(
                            chunk[0]
                        );

                        const csvContent = [
                            headers.join(","),
                            ...chunk.map((row) =>
                                headers
                                    .map(
                                        (header) =>
                                            `"${String(
                                                row[header]
                                            ).replace(
                                                /"/g,
                                                '""'
                                            )}"`
                                    )
                                    .join(",")
                            ),
                        ].join("\n");

                        fs.writeFileSync(
                            filePath,
                            csvContent
                        );

                        createdChunks.push({
                            chunkIndex: index,
                            path: filePath,
                            rowCount: chunk.length,
                        });
                    });

                    resolve(createdChunks);
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", reject);
    });
};

module.exports = splitDataset;