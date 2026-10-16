const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await taskService.createTask({
    title,
    description,
    status,
    priority,
    dueDate,
    creator: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: { task }
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks();
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: { tasks }
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await taskService.updateTask(req.params.id, {
    title,
    description,
    status,
    priority,
    dueDate
  });

  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
