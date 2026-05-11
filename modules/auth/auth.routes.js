const router = require("express").Router();
const authController = require("./auth.controller");
const authValidators = require("./auth.validators");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.post("/register", validate({ body: authValidators.register }), authController.register);
router.post("/login", validate({ body: authValidators.login }), authController.login);
router.post("/refresh", validate({ body: authValidators.refresh }), authController.refresh);
router.post("/logout", validate({ body: authValidators.logout }), authController.logout);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;
