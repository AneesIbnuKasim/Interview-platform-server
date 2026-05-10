const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [128, "Password cant exceed 20 characters"],
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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        default: null,
      },
    ],
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
    wallet: {
      balance: { type: Number, default: 0 },
    },
    banReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    bannedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
    isVerified: {
      type: String,
      default: false,
    },
    otpDetails: {
      code: { type: String },
      expiresAt: { type: Date },
      purpose: { type: String },
    },
    lastLogin: {
      type: String,
      default: null,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        default: null,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    //hashing password before saving
    if (this.isModified("password")) {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
    }
    //hashing otp before saving
    if (this.isModified("otpDetails") && this.otpDetails?.code) {
      const hashedOtp = await bcrypt.hash(this.otpDetails.code, 12);
      this.otpDetails.code = hashedOtp;
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otpDetails.code);
};

userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model("User", userSchema);
