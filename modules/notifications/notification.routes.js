const router = require("express").Router();
const notificationController = require("./notification.controller");
const notificationValidators = require("./notification.validators");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router.get(
  "/",
  validate({ query: notificationValidators.listNotifications }),
  notificationController.listNotifications,
);

router.patch("/read", notificationController.markAllRead);

router.patch(
  "/:notificationId/read",
  validate({ params: notificationValidators.notificationParams }),
  notificationController.markOneRead,
);

module.exports = router;
