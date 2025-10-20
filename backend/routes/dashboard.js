const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getStudentStats,
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/admin', protect, adminOnly, getAdminStats);
router.get('/student', protect, getStudentStats);

module.exports = router;

