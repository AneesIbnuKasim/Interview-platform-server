const asyncHandler = require("../util/asyncHandler");
const apiResponse = require("../util/apiResponse");

const getHealth = asyncHandler(async (req, res) => {
  apiResponse.success(res, {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, "Server is healthy");
});

module.exports = {
  getHealth,
};
