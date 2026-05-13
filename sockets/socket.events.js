module.exports = {
  CONNECTION_READY: "connection:ready",
  ERROR: "error",

  ROOM_JOIN: "room:join",
  ROOM_JOINED: "room:joined",
  ROOM_LEAVE: "room:leave",
  ROOM_LEFT: "room:left",
  ROOM_STATE: "room:state",

  PARTICIPANTS_STATE: "participants:state",
  PARTICIPANT_JOINED: "participant:joined",
  PARTICIPANT_LEFT: "participant:left",
  PARTICIPANT_DISCONNECTED: "participant:disconnected",
  PARTICIPANT_RECONNECTED: "participant:reconnected",
  PARTICIPANT_MEDIA_CHANGED: "participant:media-changed",
  PARTICIPANT_SPEAKING: "participant:speaking",

  MEDIA_MIC_TOGGLE: "media:mic-toggle",
  MEDIA_CAMERA_TOGGLE: "media:camera-toggle",
  MEDIA_SPEAKING: "media:speaking",

  SIGNAL_OFFER: "signal:offer",
  SIGNAL_ANSWER: "signal:answer",
  SIGNAL_ICE_CANDIDATE: "signal:ice-candidate",

  EDITOR_REQUEST_STATE: "editor:request-state",
  EDITOR_STATE: "editor:state",
  EDITOR_CHANGE: "editor:change",
  EDITOR_CHANGED: "editor:changed",
  EDITOR_LANGUAGE_CHANGE: "editor:language-change",
  EDITOR_LANGUAGE_CHANGED: "editor:language-changed",
  EDITOR_SAVE: "editor:save",
  EDITOR_SAVED: "editor:saved",
  EDITOR_SYNC_ERROR: "editor:sync-error",

  CHAT_HISTORY_REQUEST: "chat:history-request",
  CHAT_HISTORY: "chat:history",
  CHAT_MESSAGE_SEND: "chat:message-send",
  CHAT_MESSAGE_CREATED: "chat:message",
  CHAT_TYPING: "chat:typing",
  CHAT_READ: "chat:read",
  CHAT_ERROR: "chat:error",

  NOTIFICATION_NEW: "notification:new",
};
