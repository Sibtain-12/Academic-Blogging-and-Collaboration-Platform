const User = require('../models/User');

// @desc    Get all users (admins and students)
// @route   GET /api/users/all
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all students
// @route   GET /api/users
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset student password (Admin only)
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetStudentPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const studentId = req.params.id;

    // Validate input
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password and confirm password',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Find the student
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Verify student role
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Can only reset password for student users',
      });
    }

    // Update password
    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change student email (Admin only)
// @route   PUT /api/users/:id/change-email
// @access  Private/Admin
exports.changeStudentEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const studentId = req.params.id;

    // Validate input
    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new email',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    // Find the student
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Verify student role
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Can only change email for student users',
      });
    }

    // Check if new email is already in use
    const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Update email
    student.email = newEmail.toLowerCase();
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student email changed successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user',
      });
    }

    // Delete all blogs by this student
    const Blog = require('../models/Blog');
    await Blog.deleteMany({ author: user._id });

    // Delete all comments by this student
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ author: user._id });

    // Delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

