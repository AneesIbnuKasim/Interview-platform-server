const ChatMessage = require("../../models/ChatMessage");
const Notification = require("../../models/Notification");
const roomRepository = require("../rooms/room.repository");
const { AppError, NotFoundError } = require("../../util/errors");

const messagePreview = (text) => {
  if (text.length <= 120) return text;
  return `${text.slice(0, 117)}...`;
};

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
      "Join the room before using chat",
      403,
      "CHAT_ROOM_REQUIRED",
    );
  }
};

const listMessages = async (roomId, options, user) => {
  const room = await getRoom(roomId);
  ensureParticipant(room, user);

  const query = { room: room._id };
  const limit = options.limit || 50;

  if (options.before) {
    query.createdAt = { $lt: options.before };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return {
    roomId: room.code,
    messages: messages.reverse().map((message) => message.toClient()),
  };
};

const createMessage = async (roomId, payload, user) => {
  const room = await getRoom(roomId);
  ensureParticipant(room, user);

  const message = await ChatMessage.create({
    room: room._id,
    roomCode: room.code,
    author: user._id,
    authorName: user.name,
    text: payload.text,
    clientId: payload.clientId,
  });

  return {
    room,
    message: message.toClient(),
  };
};

const createMessageNotifications = async (room, message, sender) => {
  const recipients = room.participants
    .filter((participant) => {
      return (
        participant.status === "active" &&
        participant.user.toString() !== sender._id.toString()
      );
    })
    .map((participant) => participant.user);

  if (!recipients.length) {
    return [];
  }

  const docs = await Notification.insertMany(
    recipients.map((recipient) => ({
      recipient,
      room: room._id,
      roomCode: room.code,
      type: "chat:message",
      title: `New message from ${sender.name}`,
      body: messagePreview(message.text),
      data: {
        messageId: message.id,
        authorId: message.authorId,
        authorName: message.authorName,
      },
    })),
  );

  return docs.map((notification) => notification.toClient());
};

const markRoomNotificationsRead = async (roomId, user) => {
  const room = await getRoom(roomId);
  ensureParticipant(room, user);

  await Notification.updateMany(
    {
      recipient: user._id,
      room: room._id,
      readAt: null,
    },
    { $set: { readAt: new Date() } },
  );

  return { roomId: room.code };
};

module.exports = {
  createMessage,
  createMessageNotifications,
  listMessages,
  markRoomNotificationsRead,
};
