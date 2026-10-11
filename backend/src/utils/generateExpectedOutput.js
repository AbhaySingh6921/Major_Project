const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function generateExpectedOutput(inputFile, outputFile) {
    if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
    }

    const content = fs.readFileSync(inputFile, "utf8").trim();

    if (!content) {
        throw new Error("Input CSV is empty");
    }

    const lines = content.split(/\r?\n/);

    const headers = lines[0]
        .split(",")
        .map((header) =>
            header.trim().replace(/^"|"$/g, "")
        );

    const salaryIndex = headers.indexOf("salary");

    if (salaryIndex === -1) {
        throw new Error(
            "CSV must contain a salary column"
        );
    }

    let rowCount = 0;
    let totalSalary = 0;
    let minSalary = Infinity;
    let maxSalary = -Infinity;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const columns = lines[i]
            .split(",")
            .map((value) =>
                value.trim().replace(/^"|"$/g, "")
            );

        const salary = Number(columns[salaryIndex]);

        if (!Number.isFinite(salary)) {
            throw new Error(
                `Invalid salary at row ${i + 1}`
            );
        }

        rowCount++;
        totalSalary += salary;

        minSalary = Math.min(
            minSalary,
            salary
        );

        maxSalary = Math.max(
            maxSalary,
            salary
        );
    }

    const averageSalary =
        rowCount === 0
            ? 0
            : totalSalary / rowCount;

    const output = [
        "metric,value",
        `row_count,${rowCount}`,
        `total_salary,${totalSalary}`,
        `average_salary,${averageSalary}`,
        `minimum_salary,${minSalary}`,
        `maximum_salary,${maxSalary}`,
    ].join("\n") + "\n";

    fs.mkdirSync(
        path.dirname(outputFile),
        { recursive: true }
    );

    fs.writeFileSync(outputFile, output);

    const hash = crypto
        .createHash("sha256")
        .update(output)
        .digest("hex");

    return "0x" + hash;
}

module.exports = generateExpectedOutput;