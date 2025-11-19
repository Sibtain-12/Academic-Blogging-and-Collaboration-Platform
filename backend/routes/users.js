const express = require('express');
const router = express.Router();
const { getStudents, deleteStudent, resetStudentPassword, changeStudentEmail } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getStudents);
router.delete('/:id', protect, adminOnly, deleteStudent);
router.put('/:id/reset-password', protect, adminOnly, resetStudentPassword);
router.put('/:id/change-email', protect, adminOnly, changeStudentEmail);

module.exports = router;

