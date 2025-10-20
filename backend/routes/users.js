const express = require('express');
const router = express.Router();
const { getStudents, deleteStudent } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getStudents);
router.delete('/:id', protect, adminOnly, deleteStudent);

module.exports = router;

