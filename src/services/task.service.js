const Task = require('../models/task.model');
const User = require('../models/user.model');
const { NotFoundError } = require('../utils/errors');

const createTask = async (taskData) => {
  return await Task.create(taskData);
};

const getTasks = async (filter = {}) => {
  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  // Ordinary implementation: fetches creator profile for each task (N+1 query pattern)
  const tasksWithCreator = await Promise.all(
    tasks.map(async (task) => {
      const taskObj = task.toObject();
      if (task.creator) {
        const creator = await User.findById(task.creator).select('name email');
        taskObj.creator = creator;
      }
      return taskObj;
    })
  );

  return tasksWithCreator;
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const taskObj = task.toObject();
  if (task.creator) {
    taskObj.creator = await User.findById(task.creator).select('name email');
  }
  return taskObj;
};

const updateTask = async (taskId, updateData) => {
  const task = await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true
  });
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  return task;
};

const deleteTask = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  return task;
};

const assignTask = async (taskId, assigneeId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const user = await User.findById(assigneeId);
  if (!user) {
    throw new NotFoundError('Assignee user not found');
  }

  task.assignee = assigneeId;
  task.save();

  return task;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask
};
