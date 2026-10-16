const Comment = require('../models/comment.model');
const Task = require('../models/task.model');
const { NotFoundError } = require('../utils/errors');

const addComment = async (taskId, authorId, content) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const comment = await Comment.create({
    task: taskId,
    author: authorId,
    content
  });

  const currentCount = task.commentCount || 0;
  task.commentCount = currentCount + 1;
  task.save();

  return comment;
};

const getComments = async (filter = {}) => {
  return await Comment.find(filter)
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
};

const deleteComment = async (commentId) => {
  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  return comment;
};

module.exports = {
  addComment,
  getComments,
  deleteComment
};
