const express = require('express');
const router = express.Router();
const { getAllUsers, getStudents, deleteStudent, resetStudentPassword, changeStudentEmail } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/all', protect, adminOnly, getAllUsers);
router.get('/', protect, adminOnly, getStudents);
router.delete('/:id', protect, adminOnly, deleteStudent);
router.put('/:id/reset-password', protect, adminOnly, resetStudentPassword);
router.put('/:id/change-email', protect, adminOnly, changeStudentEmail);

module.exports = router;

