const router = require("express").Router();
const apiResponse = require("../utils/apiResponse");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const roomRoutes = require("../modules/rooms/room.routes");

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

module.exports = router;
