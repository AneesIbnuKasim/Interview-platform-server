const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const userService = require("./user.service");

const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.user._id);
  apiResponse.success(res, data, "Profile fetched successfully");
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateProfile(req.user._id, req.body);
  apiResponse.success(res, data, "Profile updated successfully");
});

const updateAvatar = asyncHandler(async (req, res) => {
  const data = await userService.updateAvatar(req.user._id, req.file);
  apiResponse.success(res, data, "Profile photo updated successfully");
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
};
