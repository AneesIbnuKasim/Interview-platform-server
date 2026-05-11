const User = require("../../models/User");
const { NotFoundError } = require("../../util/errors");

const getProfile = async userId => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return { user: user.toAuthJSON() };
};

module.exports = {
  getProfile,
};
