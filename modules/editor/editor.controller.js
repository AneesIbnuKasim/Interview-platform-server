const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const executionService = require("./editor.execution.service");
const playgroundFileService = require("./playground-file.service");

const runCode = asyncHandler(async (req, res) => {
  const data = await executionService.runCode(
    req.params.roomId,
    req.body,
    req.user,
  );
  apiResponse.success(res, data, "Code executed successfully");
});

const runPlaygroundCode = asyncHandler(async (req, res) => {
  const data = await executionService.runPlaygroundCode(req.body);
  apiResponse.success(res, data, "Code executed successfully");
});

const listPlaygroundFiles = asyncHandler(async (req, res) => {
  const data = await playgroundFileService.listFiles(req.user);
  apiResponse.success(res, data, "Playground files fetched successfully");
});

const createPlaygroundFile = asyncHandler(async (req, res) => {
  const data = await playgroundFileService.createFile(req.body, req.user);
  apiResponse.created(res, data, "Playground file saved successfully");
});

const updatePlaygroundFile = asyncHandler(async (req, res) => {
  const data = await playgroundFileService.updateFile(
    req.params.fileId,
    req.body,
    req.user,
  );
  apiResponse.success(res, data, "Playground file updated successfully");
});

const openPlaygroundFile = asyncHandler(async (req, res) => {
  const data = await playgroundFileService.openFile(req.params.fileId, req.user);
  apiResponse.success(res, data, "Playground file opened successfully");
});

module.exports = {
  createPlaygroundFile,
  listPlaygroundFiles,
  openPlaygroundFile,
  runCode,
  runPlaygroundCode,
  updatePlaygroundFile,
};
