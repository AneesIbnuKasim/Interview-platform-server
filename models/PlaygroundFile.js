const mongoose = require("mongoose");

const playgroundFileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: "",
    },
    stdin: {
      type: String,
      default: "",
    },
    lastOpenedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

playgroundFileSchema.index({ owner: 1, name: 1 }, { unique: true });
playgroundFileSchema.index({ owner: 1, updatedAt: -1 });

playgroundFileSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    name: this.name,
    language: this.language,
    code: this.code,
    stdin: this.stdin,
    lastOpenedAt: this.lastOpenedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("PlaygroundFile", playgroundFileSchema);
