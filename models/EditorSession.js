const mongoose = require("mongoose");

const editorSessionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      unique: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      default: "typescript",
      trim: true,
    },
    code: {
      type: String,
      default: "",
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    savedVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

editorSessionSchema.methods.toClient = function toClient() {
  return {
    roomId: this.roomCode,
    language: this.language,
    code: this.code,
    version: this.version,
    savedVersion: this.savedVersion,
    saved: this.version === this.savedVersion,
    updatedBy: this.updatedBy?.toString() || null,
    savedBy: this.savedBy?.toString() || null,
    lastSyncedAt: this.lastSyncedAt,
    savedAt: this.savedAt,
  };
};

module.exports = mongoose.model("EditorSession", editorSessionSchema);
