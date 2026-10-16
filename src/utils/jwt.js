const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const signAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn });
};

const signRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'fallback_refresh_secret_key');
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, secret, { expiresIn });
};

const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'fallback_refresh_secret_key');
  return jwt.verify(token, secret);
};

module.exports = {
  signToken: signAccessToken,
  signAccessToken,
  signRefreshToken,
  verifyToken: verifyAccessToken,
  verifyAccessToken,
  verifyRefreshToken
};
