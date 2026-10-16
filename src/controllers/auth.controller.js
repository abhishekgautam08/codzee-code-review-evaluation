const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  res.status(201).json({
    status: 'success',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.status(200).json({
    status: 'success',
    data: result
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUserProfile(req.user._id);
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

module.exports = {
  register,
  login,
  getMe
};
