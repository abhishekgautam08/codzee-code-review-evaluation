const User = require('../models/user.model');
const { signToken } = require('../utils/jwt');
const { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } = require('../utils/errors');

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email is already registered');
  }

  const user = await User.create({ name, email, password });
  const token = signToken({ id: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token
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

  const token = signToken({ id: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

const getCurrentUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new NotFoundError('User profile not found');
  }
  return user;
};

module.exports = {
  register,
  login,
  getCurrentUserProfile
};
