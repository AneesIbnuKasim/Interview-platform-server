const router = require("express").Router();
const userController = require("./user.controller");
const userValidators = require("./user.validators");
const { uploadAvatar } = require("./user.upload");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router
  .route("/me")
  .get(authenticate, userController.getProfile)
  .patch(
    authenticate,
    validate({ body: userValidators.updateProfile }),
    userController.updateProfile,
  );

router.patch(
  "/me/avatar",
  authenticate,
  uploadAvatar,
  userController.updateAvatar,
);

module.exports = router;
