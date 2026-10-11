const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
    {
        walletAddress: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        name: {
            type: String,
            required: false,
        },

        isActive: {
            type: Boolean,
            default: false,
        },

        activeJobs: {
            type: Number,
            default: 0,
        },

        completedJobs: {
            type: Number,
            default: 0,
        },

        failedJobs: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Provider", providerSchema);