const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        blockchainJobId: {
            type: Number,
            required: false,
            unique: true,
            sparse: true
        },

        requester: {
            type: String,
            required: true,
            lowercase: true
        },

        datasetName: {
            type: String,
            required: true
        },

        datasetPath: {
            type: String,
            required: true
        },

        datasetCID: {
            type: String,
            required: false
        },

        totalChunks: {
            type: Number,
            default: 5
        },

        reward: {
            type: String,
            required: true
        },

        deadline: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "UPLOADED",
                "SPLIT",
                "OPEN",
                "IN_PROGRESS",
                "COMPLETED",
                "VERIFIED",
                "SETTLED",
                "CANCELLED"
            ],
            default: "UPLOADED"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Job", jobSchema);