const commentService = require('../services/comment.service');

const addComment = async (req, res, _next) => {
  try {
    const { content } = req.body;
    const comment = await commentService.addComment(
      req.params.id,
      req.user._id,
      content
    );

    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    console.error('Failed to post comment:', error.message);
  }
};

const getComments = async (req, res, next) => {
  try {
    const filter = { task: req.params.id, ...req.query };
    const comments = await commentService.getComments(filter);

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.commentId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment
};
