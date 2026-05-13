const ROOM_PREFIX = "room:";
const RECONNECT_WINDOW_MS = 30 * 1000;

const rooms = new Map();
const socketRooms = new Map();
const recentlyDisconnected = new Map();

const roomChannel = (roomId) => `${ROOM_PREFIX}${roomId}`;

const ensureRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  return rooms.get(roomId);
};

const recentKey = (roomId, userId) => `${roomId}:${userId}`;

const cleanupRecentDisconnect = (roomId, userId) => {
  const key = recentKey(roomId, userId);
  const item = recentlyDisconnected.get(key);

  if (item?.timeout) {
    clearTimeout(item.timeout);
  }

  recentlyDisconnected.delete(key);
};

const markRecentlyDisconnected = (roomId, member) => {
  const key = recentKey(roomId, member.userId);
  const timeout = setTimeout(() => {
    recentlyDisconnected.delete(key);
  }, RECONNECT_WINDOW_MS);

  recentlyDisconnected.set(key, { member, timeout });
};

const wasRecentlyDisconnected = (roomId, userId) => {
  const item = recentlyDisconnected.get(recentKey(roomId, userId));
  cleanupRecentDisconnect(roomId, userId);
  return Boolean(item);
};

const addMember = (roomId, member) => {
  const room = ensureRoom(roomId);
  const reconnected = wasRecentlyDisconnected(roomId, member.userId);

  room.set(member.socketId, {
    ...member,
    roomId,
    media: {
      micOn: true,
      cameraOn: true,
      screenSharing: false,
      speaking: false,
      ...member.media,
    },
    connectedAt: new Date().toISOString(),
  });

  socketRooms.set(member.socketId, roomId);

  return { member: room.get(member.socketId), reconnected };
};

const removeMember = (socketId, options = {}) => {
  const roomId = socketRooms.get(socketId);
  if (!roomId) return null;

  const room = rooms.get(roomId);
  const member = room?.get(socketId);

  if (room && member) {
    room.delete(socketId);
    if (options.remember !== false) {
      markRecentlyDisconnected(roomId, member);
    }

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }

  socketRooms.delete(socketId);

  return member ? { roomId, member } : null;
};

const getRoomIdForSocket = (socketId) => socketRooms.get(socketId) || null;

const getMember = (socketId) => {
  const roomId = getRoomIdForSocket(socketId);
  return roomId ? rooms.get(roomId)?.get(socketId) || null : null;
};

const getParticipants = (roomId) => {
  return Array.from(rooms.get(roomId)?.values() || []);
};

const updateMedia = (socketId, mediaPatch) => {
  const member = getMember(socketId);
  if (!member) return null;

  member.media = {
    ...member.media,
    ...mediaPatch,
  };

  return member;
};

const stopOtherScreenShares = (roomId, socketId) => {
  const room = rooms.get(roomId);
  if (!room) return [];

  const updatedMembers = [];

  room.forEach((member, memberSocketId) => {
    if (memberSocketId === socketId || !member.media.screenSharing) return;

    member.media = {
      ...member.media,
      screenSharing: false,
    };
    updatedMembers.push(member);
  });

  return updatedMembers;
};

const findMemberSocketId = (roomId, target) => {
  if (target.socketId && rooms.get(roomId)?.has(target.socketId)) {
    return target.socketId;
  }

  if (!target.userId) return null;

  const members = getParticipants(roomId);
  return members.find((member) => member.userId === target.userId)?.socketId || null;
};

module.exports = {
  addMember,
  findMemberSocketId,
  getMember,
  getParticipants,
  getRoomIdForSocket,
  removeMember,
  roomChannel,
  stopOtherScreenShares,
  updateMedia,
};
