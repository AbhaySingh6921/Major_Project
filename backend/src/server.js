const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");
const providerRoutes = require("./routes/providerRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/providers", providerRoutes);



app.use("/api/jobs", jobRoutes);



app.get("/", (req, res) => {
    res.json({
        message: "P2P Compute Marketplace Backend",
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(
            `Server running on port ${PORT}`
        );
    });
};

startServer();