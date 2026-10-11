const fs = require("fs");
const crypto = require("crypto");

const hashFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");

        const stream = fs.createReadStream(filePath);

        stream.on("data", (chunk) => {
            hash.update(chunk);
        });

        stream.on("end", () => {
            resolve("0x" + hash.digest("hex"));
        });

        stream.on("error", reject);
    });
};

module.exports = hashFile;