const User = require("../../models/User");
const { AppError, ConflictError, NotFoundError } = require("../../util/errors");
const logger = require("../../util/logger");
const avatarStorage = require("./storage/localAvatarStorage");

const getProfile = async userId => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return { user: user.toAuthJSON() };
};

const updateProfile = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (payload.email && payload.email !== user.email) {
    const existingUser = await User.findByEmail(payload.email);

    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ConflictError("Email is already registered");
    }

    user.email = payload.email;
  }

  if (payload.name !== undefined) {
    user.name = payload.name;
  }

  if (payload.preferences) {
    const preferences = user.preferences?.toObject?.() ?? user.preferences ?? {};

    user.preferences = {
      ...preferences,
      ...payload.preferences,
    };
  }

  await user.save();

  return { user: user.toAuthJSON() };
};

const updateAvatar = async (userId, file) => {
  if (!file) {
    throw new AppError("Profile photo is required", 400, "AVATAR_REQUIRED");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const previousKey = user.avatar?.key;
  const storedAvatar = await avatarStorage.save({
    userId: user._id.toString(),
    file,
  });

  user.avatar = storedAvatar;
  await user.save();

  if (previousKey) {
    try {
      await avatarStorage.remove(previousKey);
    } catch (error) {
      logger.warn("Failed to remove previous avatar", {
        userId: user._id.toString(),
        key: previousKey,
        message: error.message,
      });
    }
  }

  return { user: user.toAuthJSON() };
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
};
