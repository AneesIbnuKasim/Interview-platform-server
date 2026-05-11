const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const userService = require("./user.service");

const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.user._id);
  apiResponse.success(res, data, "Profile fetched successfully");
});

module.exports = {
  getProfile,
};
