const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const notificationService = require("./notification.service");

const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user, req.query);
  apiResponse.success(res, data, "Notifications fetched successfully");
});

const markAllRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAllRead(req.user);
  apiResponse.success(res, data, "Notifications marked as read");
});

const markOneRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markOneRead(
    req.params.notificationId,
    req.user,
  );
  apiResponse.success(res, data, "Notification marked as read");
});

module.exports = {
  listNotifications,
  markAllRead,
  markOneRead,
};
