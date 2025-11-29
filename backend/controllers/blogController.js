const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { notifyBlogPublished } = require('../services/emailService');

// @desc    Get all published blogs with filters
// @route   GET /api/blogs
// @access  Private
exports.getBlogs = async (req, res) => {
  try {
    const { author, project, tags, keyword, startDate, endDate } = req.query;
    
    let query = { status: 'published' };

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Filter by project
    if (project) {
      query.project = project;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Filter by keyword (search in title and content)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    // Get comment counts for each blog
    const blogsWithCommentCount = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await Comment.countDocuments({ blogId: blog._id });
        return {
          ...blog.toObject(),
          commentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: blogsWithCommentCount.length,
      blogs: blogsWithCommentCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Private
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Get comment count
    const commentCount = await Comment.countDocuments({ blogId: blog._id });

    res.status(200).json({
      success: true,
      blog: {
        ...blog.toObject(),
        commentCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, project, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content',
      });
    }

    const blog = await Blog.create({
      title,
      content,
      tags: tags || [],
      project,
      status: status || 'draft',
      author: req.user.id,
      publishedAt: (status === 'published') ? Date.now() : null,
    });

    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email');

    // Send email notification asynchronously (non-blocking) if blog is published
    if (populatedBlog.status === 'published') {
      setImmediate(async () => {
        try {
          await notifyBlogPublished(populatedBlog, populatedBlog.author.name);
        } catch (emailError) {
          console.error('⚠️ Email notification failed:', emailError.message);
        }
      });
    }

    res.status(201).json({
      success: true,
      blog: populatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    const { title, content, tags, project, status } = req.body;

    const wasPublished = blog.status === 'published';
    const isBeingPublished = status === 'published' && !wasPublished;

    // Update fields
    blog.title = title;
    blog.content = content;
    blog.tags = tags;
    blog.project = project;
    blog.status = status;

    // Set publishedAt only when transitioning from draft to published
    // Do NOT modify publishedAt if status is draft or blog is already published
    if (isBeingPublished) {
      blog.publishedAt = Date.now();
    } else if (status === 'draft') {
      // Ensure publishedAt stays null for draft blogs
      blog.publishedAt = null;
    }

    // Save will trigger pre-save hook to update updatedAt
    blog = await blog.save();
    await blog.populate('author', 'name email');

    // Send email notification asynchronously (non-blocking) when transitioning from draft to published
    if (isBeingPublished) {
      setImmediate(async () => {
        try {
          await notifyBlogPublished(blog, blog.author.name);
        } catch (emailError) {
          console.error('⚠️ Email notification failed:', emailError.message);
        }
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    // Delete all comments associated with this blog
    await Comment.deleteMany({ blogId: blog._id });

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

