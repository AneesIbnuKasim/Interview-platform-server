const AuthService = require("../services/authService");
const UserService = require("../services/UserService");
const {
  updateProfileValidation,
  addressValidation,
  changePasswordValidation,
} = require("../utils/validation");
const BaseController = require("./baseController");

class UserController extends BaseController {
  static getProfile = BaseController.asyncHandler(async (req, res) => {
    const user = await UserService.getProfile(req, res);
    BaseController.logAction("GET_PROFILE", user);
    BaseController.sendSuccess(res, "Profile retrived successfully", user, 200);
  });

  static updateProfile = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      updateProfileValidation,
      req.body
    );
    const user = await UserService.updateProfile(req.user.id, validatedData);
    BaseController.logAction("PROFILE_UPDATE", user);
    BaseController.sendSuccess(res, "Profile updated successfully", user, 200);
  });

  static updateAvatar = BaseController.asyncHandler(async (req, res) => {
    const avatar = await UserService.updateAvatar(req);
    BaseController.logAction(
      "AVATAR_UPDATE",
      "Avatar updated successfully",
      avatar
    );
    BaseController.sendSuccess(res, "Avatar updated successfully", avatar, 201);
  });

  static addAddress = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      addressValidation,
      req.body
    );
    const address = await UserService.addAddress(req, validatedData);
    BaseController.logAction("ADD_ADDRESS", address);
    BaseController.sendSuccess(res, "Address added successfully", address, 201);
  });

  static updateAddress = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      addressValidation,
      req.body
    );
    const address = await UserService.updateAddress(
      req.params.id,
      validatedData
    );
    BaseController.logAction("UPDATE_ADDRESS", address);
    BaseController.sendSuccess(
      res,
      "Address updated successfully",
      address,
      201
    );
  });

  static changePassword = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      changePasswordValidation,
      req.body
    );
    await UserService.changePassword(req.user._id, validatedData);
    BaseController.logAction("PASSWORD-CHANGE", req.user);
    BaseController.sendSuccess(res, "Password changed successfully");
  });

}

module.exports = UserController;
