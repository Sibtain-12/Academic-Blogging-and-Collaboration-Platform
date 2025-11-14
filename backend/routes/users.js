const express = require('express');
const router = express.Router();
const { getStudents, deleteStudent, resetStudentPassword } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getStudents);
router.delete('/:id', protect, adminOnly, deleteStudent);
router.put('/:id/reset-password', protect, adminOnly, resetStudentPassword);

module.exports = router;

