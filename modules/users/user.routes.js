const router = require("express").Router();
const userController = require("./user.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

router.get("/me", authenticate, userController.getProfile);

module.exports = router;
