const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
      index: true,
    },
    roomCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: "",
      index: true,
    },
    type: {
      type: String,
      enum: ["chat:message"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

notificationSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    recipientId: this.recipient.toString(),
    type: this.type,
    title: this.title,
    body: this.body,
    roomId: this.roomCode || null,
    data: this.data || {},
    read: Boolean(this.readAt),
    readAt: this.readAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Notification", notificationSchema);
