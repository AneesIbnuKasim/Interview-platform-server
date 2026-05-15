const User = require("../../models/User");
const { ConflictError, NotFoundError } = require("../../util/errors");

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

  if (payload.timezone !== undefined) {
    user.timezone = payload.timezone;
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

module.exports = {
  getProfile,
  updateProfile,
};
