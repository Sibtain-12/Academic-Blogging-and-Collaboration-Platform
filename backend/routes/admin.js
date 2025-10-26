const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getStudentAnalytics, getStudentBlogs } = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/student-analytics
// @desc    Get student blog analytics
// @access  Private/Admin
router.get('/student-analytics', getStudentAnalytics);

// @route   GET /api/admin/student/:studentId/blogs
// @desc    Get filtered blogs for a specific student
// @access  Private/Admin
router.get('/student/:studentId/blogs', getStudentBlogs);

module.exports = router;

