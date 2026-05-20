const mongoose = require("mongoose");

const teamInvitationSchema = new mongoose.Schema(
  {
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
      index: true,
    },
    inviteeName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
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
      maxlength: 32,
    },
    roomTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
      index: true,
    },
    emailSkipped: {
      type: Boolean,
      default: false,
    },
    lastError: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

teamInvitationSchema.index({ inviter: 1, sentAt: -1 });

teamInvitationSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    inviterId: this.inviter.toString(),
    inviteeEmail: this.inviteeEmail,
    inviteeName: this.inviteeName,
    roomId: this.roomCode,
    roomObjectId: this.room?.toString() || null,
    roomCode: this.roomCode,
    roomTitle: this.roomTitle,
    status: this.status,
    emailSkipped: this.emailSkipped,
    lastError: this.lastError,
    sentAt: this.sentAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("TeamInvitation", teamInvitationSchema);
