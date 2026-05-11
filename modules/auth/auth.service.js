const User = require("../../models/User");
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} = require("../../util/errors");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  getTokenExpiry,
} = require("../../util/jwt");

const buildPayload = user => ({
  id: user._id.toString(),
  role: user.role,
});

const sanitizeExpiredRefreshTokens = user => {
  const now = new Date();
  user.refreshTokens = user.refreshTokens.filter(token => token.expiresAt > now);
};

const createTokenPair = user => {
  const payload = buildPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    refreshTokenHash: hashToken(refreshToken),
    refreshTokenExpiresAt: getTokenExpiry(refreshToken),
  };
};

const attachRefreshToken = (user, tokenPair) => {
  sanitizeExpiredRefreshTokens(user);
  user.refreshTokens.push({
    tokenHash: tokenPair.refreshTokenHash,
    expiresAt: tokenPair.refreshTokenExpiresAt,
  });
};

const buildAuthResponse = (user, tokenPair) => ({
  user: user.toAuthJSON(),
  accessToken: tokenPair.accessToken,
  refreshToken: tokenPair.refreshToken,
});

const register = async payload => {
  const existingUser = await User.findByEmail(payload.email);

  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  const user = new User(payload);
  const tokenPair = createTokenPair(user);

  attachRefreshToken(user, tokenPair);
  await user.save();

  return buildAuthResponse(user, tokenPair);
};

const login = async ({ email, password }) => {
  const user = await User.findByEmail(email).select("+password +refreshTokens");

  if (!user || user.status !== "active") {
    throw new AuthenticationError("Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new AuthenticationError("Invalid email or password");
  }

  const tokenPair = createTokenPair(user);
  user.lastLoginAt = new Date();

  attachRefreshToken(user, tokenPair);
  await user.save();

  return buildAuthResponse(user, tokenPair);
};

const refresh = async refreshToken => {
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");

  if (!user || user.status !== "active") {
    throw new AuthenticationError("Invalid refresh token");
  }

  sanitizeExpiredRefreshTokens(user);

  const currentHash = hashToken(refreshToken);
  const tokenExists = user.refreshTokens.some(token => token.tokenHash === currentHash);

  if (!tokenExists) {
    await user.save();
    throw new AuthenticationError("Invalid refresh token");
  }

  user.refreshTokens = user.refreshTokens.filter(token => token.tokenHash !== currentHash);

  const tokenPair = createTokenPair(user);
  attachRefreshToken(user, tokenPair);
  await user.save();

  return buildAuthResponse(user, tokenPair);
};

const logout = async refreshToken => {
  if (!refreshToken) return;

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return;
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user) return;

  const currentHash = hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens.filter(token => token.tokenHash !== currentHash);
  await user.save();
};

const getProfile = async userId => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return { user: user.toAuthJSON() };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
};
