const Notification = require("../../models/Notification");
const { NotFoundError } = require("../../util/errors");

const listNotifications = async (user, options = {}) => {
  const query = { recipient: user._id };
  const limit = options.limit || 20;

  if (options.unreadOnly) {
    query.readAt = null;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return {
    notifications: notifications.map((notification) => notification.toClient()),
  };
};

const markAllRead = async (user) => {
  await Notification.updateMany(
    { recipient: user._id, readAt: null },
    { $set: { readAt: new Date() } },
  );

  return listNotifications(user);
};

const markOneRead = async (notificationId, user) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: user._id },
    { $set: { readAt: new Date() } },
    { new: true },
  );

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  return { notification: notification.toClient() };
};

module.exports = {
  listNotifications,
  markAllRead,
  markOneRead,
};
