const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// @desc    Get all comments for a blog
// @route   GET /api/comments/:blogId
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { blogId, text } = req.body;

    if (!blogId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide blog ID and comment text',
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Only allow comments on published blogs
    if (blog.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on unpublished blogs',
      });
    }

    const comment = await Comment.create({
      blogId,
      text,
      author: req.user.id,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email');

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Get the blog to check if user is the blog author
    const blog = await Blog.findById(comment.blogId);

    // Check if user is the comment author, blog author, or admin
    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isBlogAuthor = blog && blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isBlogAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

