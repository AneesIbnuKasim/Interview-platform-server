const Room = require("../../models/Room");

const create = (roomData) => Room.create(roomData);

const findByCode = (code) => Room.findOne({ code: code.toUpperCase() });

const findByIdOrCode = (roomId) => {
  if (/^[0-9a-fA-F]{24}$/.test(roomId)) {
    return Room.findById(roomId);
  }

  return findByCode(roomId);
};

const listForUser = (userId, options = {}) => {
  const limit = options.limit || 20;

  return Room.find({
    $or: [{ owner: userId }, { "participants.user": userId }],
    status: { $ne: "archived" },
  })
    .sort({ updatedAt: -1 })
    .limit(limit);
};

module.exports = {
  create,
  findByCode,
  findByIdOrCode,
  listForUser,
};
