const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const screenshotService = require("./screenshot.service");

const uploadScreenshot = asyncHandler(async (req, res) => {
  const data = await screenshotService.uploadScreenshot(
    req.params.roomId,
    req.body,
    req.file,
    req.user,
  );

  apiResponse.created(res, data, "Screenshot uploaded successfully");
});

const listScreenshots = asyncHandler(async (req, res) => {
  const data = await screenshotService.listScreenshots(
    req.params.roomId,
    req.query,
    req.user,
  );

  apiResponse.success(res, data, "Screenshots fetched successfully");
});

module.exports = {
  listScreenshots,
  uploadScreenshot,
};
