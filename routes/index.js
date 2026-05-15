const router = require("express").Router();
const apiResponse = require("../util/apiResponse");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const roomRoutes = require("../modules/rooms/room.routes");
const editorRoutes = require("../modules/editor/editor.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");
const screenshotRoutes = require("../modules/screenshots/screenshot.routes");

router.get("/", (req, res) => {
  apiResponse.success(res, {
    name: "Pairloop API",
    version: "1.0.0",
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);
router.use("/editor", editorRoutes);
router.use("/notifications", notificationRoutes);
router.use("/", screenshotRoutes);

module.exports = router;
