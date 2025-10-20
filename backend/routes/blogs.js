const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getDrafts,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

router.get('/drafts', protect, getDrafts);
router.get('/', protect, getBlogs);
router.get('/:id', protect, getBlog);
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;

