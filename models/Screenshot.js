const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema(
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploaderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    originalName: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },
  },
  { timestamps: true },
);

screenshotSchema.index({ room: 1, createdAt: -1 });

screenshotSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    roomId: this.roomCode,
    uploadedBy: this.uploadedBy.toString(),
    uploaderName: this.uploaderName,
    title: this.title,
    url: this.url,
    mimeType: this.mimeType,
    size: this.size,
    originalName: this.originalName,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Screenshot", screenshotSchema);
