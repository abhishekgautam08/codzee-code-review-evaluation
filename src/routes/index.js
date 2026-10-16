const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
