const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const generateAuthTokens = async (user) => {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  // Expire refresh token in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt
  });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, role = 'member' }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email is already registered');
  }

  const user = await User.create({ name, email, password, role });
  const tokens = await generateAuthTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    ...tokens,
    token: tokens.accessToken
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await generateAuthTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    ...tokens,
    token: tokens.accessToken
  };
};

const refreshTokens = async (oldRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (_err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const existingToken = await RefreshToken.findOne({ token: oldRefreshToken });

  // Token reuse detection: if a revoked token is sent again, compromise detected!
  if (existingToken && existingToken.revoked) {
    await RefreshToken.updateMany({ user: decoded.id }, { revoked: true, revokedAt: new Date() });
    throw new UnauthorizedError('Compromised refresh token reuse detected. All sessions revoked.');
  }

  if (!existingToken || existingToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new UnauthorizedError('User belonging to this token no longer exists');
  }

  // Rotate tokens: revoke current refresh token and issue new pair
  const newAccessToken = signAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = signRefreshToken({ id: user._id });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  existingToken.revoked = true;
  existingToken.revokedAt = new Date();
  existingToken.replacedByToken = newRefreshToken;
  await existingToken.save();

  await RefreshToken.create({
    token: newRefreshToken,
    user: user._id,
    expiresAt
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken
  };
};

const logout = async (tokenString) => {
  if (!tokenString) {
    return;
  }
  await RefreshToken.findOneAndUpdate(
    { token: tokenString },
    { revoked: true, revokedAt: new Date() }
  );
};

const getAllUsers = async () => {
  return await User.find().select('-password').sort({ createdAt: -1 });
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  getAllUsers
};
