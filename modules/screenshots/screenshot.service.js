const Screenshot = require("../../models/Screenshot");
const roomRepository = require("../rooms/room.repository");
const { AppError, NotFoundError } = require("../../util/errors");
const localStorage = require("./storage/localScreenshotStorage");

const storage = localStorage;

const getRoom = async (roomId) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  return room;
};

const ensureParticipant = (room, user) => {
  const isParticipant = room.participants.some(
    (participant) => participant.user.toString() === user._id.toString(),
  );

  if (!isParticipant) {
    throw new AppError(
      "Join the room before uploading screenshots",
      403,
      "SCREENSHOT_ROOM_REQUIRED",
    );
  }
};

const uploadScreenshot = async (roomId, payload, file, user) => {
  if (!file) {
    throw new AppError("Screenshot file is required", 400, "SCREENSHOT_REQUIRED");
  }

  const room = await getRoom(roomId);
  ensureParticipant(room, user);

  const storedFile = await storage.save({
    roomCode: room.code,
    file,
  });

  const screenshot = await Screenshot.create({
    room: room._id,
    roomCode: room.code,
    uploadedBy: user._id,
    uploaderName: user.name,
    title: payload.title,
    key: storedFile.key,
    url: storedFile.url,
    mimeType: file.mimetype,
    size: file.size,
    originalName: file.originalname,
  });

  return {
    screenshot: screenshot.toClient(),
  };
};

const listScreenshots = async (roomId, options, user) => {
  const room = await getRoom(roomId);
  ensureParticipant(room, user);

  const screenshots = await Screenshot.find({ room: room._id })
    .sort({ createdAt: -1 })
    .limit(options.limit || 30);

  return {
    roomId: room.code,
    screenshots: screenshots.map((screenshot) => screenshot.toClient()),
  };
};

module.exports = {
  listScreenshots,
  uploadScreenshot,
};
