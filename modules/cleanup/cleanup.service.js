const ChatMessage = require("../../models/ChatMessage");
const EditorSession = require("../../models/EditorSession");
const Notification = require("../../models/Notification");
const Room = require("../../models/Room");
const Screenshot = require("../../models/Screenshot");
const logger = require("../../util/logger");
const screenshotStorage = require("../screenshots/storage/localScreenshotStorage");

const DAY_MS = 24 * 60 * 60 * 1000;
const ROOM_RETENTION_DAYS = 7;
const READ_NOTIFICATION_RETENTION_DAYS = 2;

const createEmptyRoomStats = () => ({
  roomsDeleted: 0,
  chatMessagesDeleted: 0,
  editorSessionsDeleted: 0,
  screenshotsDeleted: 0,
  screenshotFilesRemoved: 0,
  screenshotFilesSkipped: 0,
  roomNotificationsDeleted: 0,
});

const findExpiredRooms = async (now = new Date()) => {
  const cutoff = new Date(now.getTime() - ROOM_RETENTION_DAYS * DAY_MS);

  return Room.find({
    $or: [
      {
        status: "ended",
        endedAt: { $ne: null, $lte: cutoff },
      },
      {
        status: "archived",
        updatedAt: { $lte: cutoff },
      },
    ],
  }).select("_id code");
};

const removeScreenshotFiles = async (screenshots) => {
  const stats = {
    screenshotFilesRemoved: 0,
    screenshotFilesSkipped: 0,
  };

  for (const screenshot of screenshots) {
    try {
      const result = await screenshotStorage.remove(screenshot.key);

      if (result.removed) {
        stats.screenshotFilesRemoved += 1;
      } else {
        stats.screenshotFilesSkipped += 1;
      }
    } catch (error) {
      stats.screenshotFilesSkipped += 1;
      logger.warn("Screenshot file cleanup failed", {
        key: screenshot.key,
        message: error.message,
      });
    }
  }

  return stats;
};

const cleanupExpiredRooms = async (now = new Date()) => {
  const rooms = await findExpiredRooms(now);
  const stats = createEmptyRoomStats();

  if (!rooms.length) {
    return stats;
  }

  const roomIds = rooms.map((room) => room._id);
  const roomCodes = rooms.map((room) => room.code);
  const screenshots = await Screenshot.find({ room: { $in: roomIds } }).select(
    "key",
  );
  const fileStats = await removeScreenshotFiles(screenshots);

  stats.screenshotFilesRemoved = fileStats.screenshotFilesRemoved;
  stats.screenshotFilesSkipped = fileStats.screenshotFilesSkipped;

  const [
    chatMessages,
    editorSessions,
    screenshotDocs,
    roomNotifications,
    deletedRooms,
  ] = await Promise.all([
    ChatMessage.deleteMany({ room: { $in: roomIds } }),
    EditorSession.deleteMany({ room: { $in: roomIds } }),
    Screenshot.deleteMany({ room: { $in: roomIds } }),
    Notification.deleteMany({
      $or: [{ room: { $in: roomIds } }, { roomCode: { $in: roomCodes } }],
    }),
    Room.deleteMany({ _id: { $in: roomIds } }),
  ]);

  stats.chatMessagesDeleted = chatMessages.deletedCount || 0;
  stats.editorSessionsDeleted = editorSessions.deletedCount || 0;
  stats.screenshotsDeleted = screenshotDocs.deletedCount || 0;
  stats.roomNotificationsDeleted = roomNotifications.deletedCount || 0;
  stats.roomsDeleted = deletedRooms.deletedCount || 0;

  return stats;
};

const cleanupReadNotifications = async (now = new Date()) => {
  const cutoff = new Date(
    now.getTime() - READ_NOTIFICATION_RETENTION_DAYS * DAY_MS,
  );
  const result = await Notification.deleteMany({
    readAt: { $ne: null, $lte: cutoff },
  });

  return {
    notificationsDeleted: result.deletedCount || 0,
  };
};

const runCleanup = async (now = new Date()) => {
  const startedAt = Date.now();
  const roomStats = await cleanupExpiredRooms(now);
  const notificationStats = await cleanupReadNotifications(now);
  const result = {
    ...roomStats,
    ...notificationStats,
    durationMs: Date.now() - startedAt,
  };

  logger.info("Cleanup job completed", result);
  return result;
};

module.exports = {
  READ_NOTIFICATION_RETENTION_DAYS,
  ROOM_RETENTION_DAYS,
  cleanupExpiredRooms,
  cleanupReadNotifications,
  runCleanup,
};
