const EditorSession = require("../../models/EditorSession");
const roomRepository = require("../rooms/room.repository");
const { AppError, NotFoundError } = require("../../util/errors");
const logger = require("../../util/logger");
const {
  defaultLanguage,
  starterCode,
  supportedLanguages,
} = require("./editor.defaults");

const MAX_CODE_SIZE = 512 * 1024;
const PERSIST_DEBOUNCE_MS = 750;
const sessionCache = new Map();
const persistTimers = new Map();

const normalizeRoomId = (roomId) => roomId.toUpperCase();

const cacheSession = (session) => {
  sessionCache.set(session.roomCode, session);
  return session;
};

const persistNow = async (session) => {
  const timer = persistTimers.get(session.roomCode);

  if (timer) {
    clearTimeout(timer);
    persistTimers.delete(session.roomCode);
  }

  await session.save();
  cacheSession(session);
};

const schedulePersist = (session) => {
  const currentTimer = persistTimers.get(session.roomCode);

  if (currentTimer) {
    clearTimeout(currentTimer);
  }

  const timer = setTimeout(() => {
    persistTimers.delete(session.roomCode);
    session.save()
      .then(() => cacheSession(session))
      .catch((error) => {
        logger.error("Editor session persistence failed", {
          roomCode: session.roomCode,
          message: error.message,
        });
      });
  }, PERSIST_DEBOUNCE_MS);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  persistTimers.set(session.roomCode, timer);
};

const ensureSupportedLanguage = (language) => {
  if (!supportedLanguages.includes(language)) {
    throw new AppError(
      "Unsupported editor language",
      400,
      "UNSUPPORTED_LANGUAGE",
    );
  }
};

const ensureCodeSize = (code) => {
  if (Buffer.byteLength(code || "", "utf8") > MAX_CODE_SIZE) {
    throw new AppError(
      "Editor content is too large",
      413,
      "EDITOR_CONTENT_TOO_LARGE",
    );
  }
};

const isStaleVersion = (payloadVersion, sessionVersion) => {
  return payloadVersion !== undefined && payloadVersion < sessionVersion;
};

const assignUser = (session, field, user) => {
  if (user?._id) {
    session[field] = user._id;
  }
};

const getRoom = async (roomId) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  return room;
};

const createSessionForRoom = async (room) => {
  const code = starterCode[defaultLanguage];

  try {
    return await EditorSession.create({
      room: room._id,
      roomCode: room.code,
      language: defaultLanguage,
      code,
      version: 1,
      savedVersion: 1,
    });
  } catch (error) {
    if (error.code === 11000) {
      return EditorSession.findOne({ room: room._id });
    }

    throw error;
  }
};

const getOrCreateSession = async (roomId) => {
  const room = await getRoom(roomId);
  const roomCode = normalizeRoomId(room.code);
  const cachedSession = sessionCache.get(roomCode);

  if (cachedSession) {
    return cachedSession;
  }

  const existingSession = await EditorSession.findOne({ room: room._id });

  if (existingSession) {
    return cacheSession(existingSession);
  }

  const session = await createSessionForRoom(room);
  session.roomCode = roomCode;
  return cacheSession(session);
};

const getState = async (roomId) => {
  const session = await getOrCreateSession(roomId);
  return session.toClient();
};

const applyCodeChange = async (roomId, payload, user) => {
  const session = await getOrCreateSession(roomId);
  const nextCode = payload.code ?? "";

  ensureCodeSize(nextCode);

  if (isStaleVersion(payload.version, session.version)) {
    return {
      accepted: false,
      reason: "STALE_VERSION",
      state: session.toClient(),
    };
  }

  if (session.code === nextCode) {
    return {
      accepted: false,
      reason: "NO_CHANGE",
      state: session.toClient(),
    };
  }

  session.code = nextCode;
  session.version += 1;
  assignUser(session, "updatedBy", user);
  session.lastSyncedAt = new Date();

  schedulePersist(session);

  return {
    accepted: true,
    state: session.toClient(),
  };
};

const changeLanguage = async (roomId, payload, user) => {
  const session = await getOrCreateSession(roomId);
  const language = payload.language;

  ensureSupportedLanguage(language);

  if (isStaleVersion(payload.version, session.version)) {
    return {
      accepted: false,
      reason: "STALE_VERSION",
      state: session.toClient(),
    };
  }

  const nextCode = payload.code ?? starterCode[language] ?? session.code;
  ensureCodeSize(nextCode);

  if (session.language === language && session.code === nextCode) {
    return {
      accepted: false,
      reason: "NO_CHANGE",
      state: session.toClient(),
    };
  }

  session.language = language;
  session.code = nextCode;
  session.version += 1;
  assignUser(session, "updatedBy", user);
  session.lastSyncedAt = new Date();

  schedulePersist(session);

  return {
    accepted: true,
    state: session.toClient(),
  };
};

const saveSession = async (roomId, user) => {
  const session = await getOrCreateSession(roomId);

  session.savedVersion = session.version;
  assignUser(session, "savedBy", user);
  session.savedAt = new Date();

  await persistNow(session);

  return session.toClient();
};

module.exports = {
  applyCodeChange,
  changeLanguage,
  getState,
  saveSession,
};
