const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const env = require("../config/env");

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      key: {
        type: String,
        default: "",
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      autoRecordSessions: {
        type: Boolean,
        default: false,
      },
      defaultEditorTheme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark",
      },
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, env.bcryptRounds);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
  };
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model("User", userSchema);
