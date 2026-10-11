const fs = require("fs");

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error("Usage: node compute.js <input> <output>");
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
}

const content = fs.readFileSync(inputFile, "utf8").trim();

if (!content) {
    throw new Error("Input CSV is empty");
}

const lines = content.split(/\r?\n/);

const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/^"|"$/g, ""));

const salaryIndex = headers.indexOf("salary");

if (salaryIndex === -1) {
    throw new Error("CSV must contain a salary column");
}

let rowCount = 0;
let totalSalary = 0;
let minSalary = Infinity;
let maxSalary = -Infinity;

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const columns = lines[i]
        .split(",")
        .map((value) => value.trim().replace(/^"|"$/g, ""));

    const salary = Number(columns[salaryIndex]);

    if (!Number.isFinite(salary)) {
        throw new Error(
            `Invalid salary at row ${i + 1}: ${columns[salaryIndex]}`
        );
    }

    rowCount++;
    totalSalary += salary;

    minSalary = Math.min(minSalary, salary);
    maxSalary = Math.max(maxSalary, salary);
}

const averageSalary =
    rowCount === 0 ? 0 : totalSalary / rowCount;

const output = [
    "metric,value",
    `row_count,${rowCount}`,
    `total_salary,${totalSalary}`,
    `average_salary,${averageSalary}`,
    `minimum_salary,${minSalary}`,
    `maximum_salary,${maxSalary}`,
].join("\n") + "\n";

fs.writeFileSync(outputFile, output);

console.log("Computation completed.");
console.log(output);