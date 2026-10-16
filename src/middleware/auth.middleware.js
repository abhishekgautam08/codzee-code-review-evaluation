const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication token missing or invalid'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (_err) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new UnauthorizedError('User belonging to this token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ForbiddenError('You do not have permission to perform this action'));
  }
  next();
};

module.exports = {
  authenticate,
  authorize
};
