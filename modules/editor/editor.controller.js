const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const executionService = require("./editor.execution.service");

const runCode = asyncHandler(async (req, res) => {
  const data = await executionService.runCode(req.params.roomId, req.body, req.user);
  apiResponse.success(res, data, "Code executed successfully");
});

module.exports = {
  runCode,
};
