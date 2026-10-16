const Task = require('../models/task.model');
const { NotFoundError } = require('../utils/errors');

/**
 * Creates a new task.
 * @param {Object} taskData - Task payload
 * @returns {Promise<Object>} Created task document
 */
const createTask = async (taskData) => {
  const task = await Task.create(taskData);
  return task;
};

/**
 * Retrieves tasks with creator and assignee populated via single-query joins,
 * resolving the prior N+1 query bottleneck.
 * @param {Object} filter - Query filter conditions
 * @returns {Promise<Array>} List of populated task documents
 */
const getTasks = async (filter = {}) => {
  return await Task.find(filter)
    .populate('creator', 'name email')
    .populate('assignee', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Retrieves a single task by ID with author details populated.
 * @param {string} taskId - Target task ID
 * @returns {Promise<Object>} Populated task document
 */
const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('creator', 'name email')
    .populate('assignee', 'name email')
    .lean();

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return task;
};

/**
 * Updates a task by ID.
 * @param {string} taskId - Target task ID
 * @param {Object} updateData - Data fields to update
 * @returns {Promise<Object>} Updated task document
 */
const updateTask = async (taskId, updateData) => {
  const task = await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true
  })
    .populate('creator', 'name email')
    .populate('assignee', 'name email');

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return task;
};

/**
 * Deletes a task by ID.
 * @param {string} taskId - Target task ID
 * @returns {Promise<Object>} Deleted task document
 */
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
