const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getStudentAnalytics } = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/student-analytics
// @desc    Get student blog analytics
// @access  Private/Admin
router.get('/student-analytics', getStudentAnalytics);

module.exports = router;

