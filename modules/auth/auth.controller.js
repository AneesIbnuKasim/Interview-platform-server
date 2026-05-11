const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  apiResponse.created(res, data, "Account created successfully");
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  apiResponse.success(res, data, "Logged in successfully");
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.body.refreshToken);
  apiResponse.success(res, data, "Token refreshed successfully");
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  apiResponse.success(res, null, "Logged out successfully");
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user._id);
  apiResponse.success(res, data, "Profile fetched successfully");
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
};
