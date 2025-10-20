const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:blogId', protect, getComments);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;

