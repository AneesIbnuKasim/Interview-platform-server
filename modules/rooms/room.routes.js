const router = require("express").Router();
const roomController = require("./room.controller");
const roomValidators = require("./room.validators");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router
  .route("/")
  .get(validate({ query: roomValidators.listRooms }), roomController.listRooms)
  .post(validate({ body: roomValidators.createRoom }), roomController.createRoom);

router.post(
  "/join",
  validate({ body: roomValidators.joinRoom }),
  roomController.joinRoomByCode,
);

router
  .route("/:roomId")
  .get(validate({ params: roomValidators.roomParams }), roomController.getRoom);

router.post(
  "/:roomId/join",
  validate({
    params: roomValidators.joinRoomParams,
    body: roomValidators.joinRoomByPath,
  }),
  roomController.joinRoom,
);

router.post(
  "/:roomId/leave",
  validate({ params: roomValidators.roomParams }),
  roomController.leaveRoom,
);

router.patch(
  "/:roomId/status",
  validate({ params: roomValidators.roomParams, body: roomValidators.updateStatus }),
  roomController.updateStatus,
);

module.exports = router;
