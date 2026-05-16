const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["interviewer", "candidate", "observer"],
      default: "interviewer",
    },
    status: {
      type: String,
      enum: ["pending", "active", "left"],
      default: "active",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    requestedAt: {
      type: Date,
      default: null,
    },
    admittedAt: {
      type: Date,
      default: null,
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    candidateName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    candidateEmail: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 160,
      default: "",
    },
    interviewType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "Coding Interview",
    },
    status: {
      type: String,
      enum: ["waiting", "active", "ended", "archived"],
      default: "waiting",
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

roomSchema.methods.toClient = function toClient() {
  return {
    _id: this._id.toString(),
    id: this.code,
    code: this.code,
    title: this.title,
    candidateName: this.candidateName,
    candidateEmail: this.candidateEmail,
    interviewType: this.interviewType,
    status: this.status,
    ownerId: this.owner?.toString(),
    participants: this.participants.map((participant) => ({
      id: participant.user.toString(),
      name: participant.name,
      role: participant.role,
      status: participant.status,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      requestedAt: participant.requestedAt,
      admittedAt: participant.admittedAt,
      admittedBy: participant.admittedBy?.toString() || null,
    })),
    scheduledAt: this.scheduledAt,
    startedAt: this.startedAt,
    endedAt: this.endedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Room", roomSchema);
