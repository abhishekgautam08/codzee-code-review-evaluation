const Task = require('../models/task.model');
const User = require('../models/user.model');
const { NotFoundError } = require('../utils/errors');

const createTask = async (taskData) => {
  return await Task.create(taskData);
};

const getTasks = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    priority,
    search
  } = queryParams;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

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

  return {
    tasks: tasksWithCreator,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
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

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
