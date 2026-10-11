const express = require("express");
const router = express.Router();

const providerController = require("../controllers/providerController");

router.get(
    "/subjobs/open",
    providerController.getOpenSubJobs
);

router.get(
    "/subjobs/:mongoId/download",
    providerController.downloadSubJobChunk
);

module.exports = router;