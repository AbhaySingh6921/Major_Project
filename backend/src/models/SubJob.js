const mongoose = require("mongoose");

const subJobSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        blockchainJobId: {
            type: Number,
            required: true,
        },

        subJobId: {
            type: Number,
            required: true,
        },

        chunkIndex: {
            type: Number,
            required: true,
        },

        chunkPath: {
            type: String,
            required: true,
        },

        inputHash: {
            type: String,
            required: true,
        },

        expectedOutputHash: {
            type: String,
            required: true,
        },

        outputPath: {
            type: String,
            required: false,
        },

        outputHash: {
            type: String,
            required: false,
        },

        provider: {
            type: String,
            default: null,
            lowercase: true,
        },

        reward: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "OPEN",
                "ACCEPTED",
                "PROCESSING",
                "COMPLETED",
                "VERIFIED",
                "DISPUTED",
                "SETTLED",
                "CANCELLED",
            ],
            default: "OPEN",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SubJob", subJobSchema);