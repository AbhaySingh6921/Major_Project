const providerService = require("../services/providerService");

async function getOpenSubJobs(req, res) {
  try {
    const subJobs = await providerService.getOpenSubJobs();

    res.status(200).json({
      success: true,
      count: subJobs.length,
      subJobs,
    });
  } catch (error) {
    console.error("Error fetching open subjobs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch open subjobs",
    });
  }
}

async function downloadSubJobChunk(req, res) {
  try {
    const { mongoId } = req.params;

    const { subJob, filePath } = await providerService.getSubJobChunk(mongoId);

    res.download(
      filePath,
      `subjob-${subJob.subJobId}-chunk-${subJob.chunkIndex}.csv`,
      (error) => {
        if (error) {
          console.error("File download error:", error);

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Failed to download chunk",
            });
          }
        }
      },
    );
  } catch (error) {
    console.error("Download chunk error:", error);

    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getOpenSubJobs,
  downloadSubJobChunk,
};
