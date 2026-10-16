const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router
  .route('/')
  .post(taskController.createTask)
  .get(taskController.getTasks);

router
  .route('/:id')
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

router.patch('/:id/assign', taskController.assignTask);

router
  .route('/:id/comments')
  .post(commentController.addComment)
  .get(commentController.getComments);

router.delete('/:id/comments/:commentId', commentController.deleteComment);

module.exports = router;
