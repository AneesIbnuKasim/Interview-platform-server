const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    clientId: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ room: 1, createdAt: -1 });

chatMessageSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    roomId: this.roomCode,
    authorId: this.author.toString(),
    authorName: this.authorName,
    text: this.text,
    clientId: this.clientId || null,
    ts: this.createdAt?.getTime?.() || Date.now(),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
