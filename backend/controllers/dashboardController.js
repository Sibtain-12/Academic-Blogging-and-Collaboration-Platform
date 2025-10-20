const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get admin dashboard statistics (admin's own blogs)
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    // Admin's own blogs (all statuses)
    const totalBlogs = await Blog.countDocuments({ author: req.user.id });

    // Admin's published blogs
    const publishedBlogs = await Blog.countDocuments({
      author: req.user.id,
      status: 'published'
    });

    // Admin's draft blogs
    const draftBlogs = await Blog.countDocuments({
      author: req.user.id,
      status: 'draft'
    });

    // Admin's deleted blogs
    const deletedBlogs = await Blog.countDocuments({
      author: req.user.id,
      status: 'deleted'
    });

    // Total comments on admin's blogs
    const adminBlogs = await Blog.find({ author: req.user.id }).select('_id');
    const blogIds = adminBlogs.map((blog) => blog._id);
    const totalComments = await Comment.countDocuments({ blogId: { $in: blogIds } });

    // Total students (for reference)
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Admin's own blogs (all statuses, sorted by most recent)
    const myBlogs = await Blog.find({ author: req.user.id })
      .populate('author', 'name email')
      .sort({ updatedAt: -1 });

    // Add comment count to each blog
    const blogsWithCommentCount = await Promise.all(
      myBlogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({ blogId: blog._id });
        return {
          ...blog.toObject(),
          commentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        deletedBlogs,
        totalComments,
        totalStudents,
        myBlogs: blogsWithCommentCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student dashboard statistics
// @route   GET /api/dashboard/student
// @access  Private
exports.getStudentStats = async (req, res) => {
  try {
    // Total blogs by student
    const totalBlogs = await Blog.countDocuments({ author: req.user.id });

    // Total comments on student's blogs
    const studentBlogs = await Blog.find({ author: req.user.id }).select('_id');
    const blogIds = studentBlogs.map((blog) => blog._id);
    const totalComments = await Comment.countDocuments({ blogId: { $in: blogIds } });

    // Student's blogs
    const myBlogs = await Blog.find({ author: req.user.id })
      .populate('author', 'name email')
      .sort({ updatedAt: -1 });

    // Add comment count to each blog
    const blogsWithCommentCount = await Promise.all(
      myBlogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({ blogId: blog._id });
        return {
          ...blog.toObject(),
          commentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        totalBlogs,
        totalComments,
        myBlogs: blogsWithCommentCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

