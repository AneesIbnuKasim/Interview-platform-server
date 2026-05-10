const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const getHealth = asyncHandler(async (req, res) => {
  apiResponse.success(res, {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, "Server is healthy");
});

module.exports = {
  getHealth,
};
