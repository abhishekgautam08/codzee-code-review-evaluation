const taskService = require('../services/task.service');

const createTask = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks();
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    const task = await taskService.assignTask(req.params.id, assigneeId);
    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask
};
