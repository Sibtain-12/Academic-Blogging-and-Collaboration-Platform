const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');

// @desc    Get student analytics (blog statistics per student, excluding admin)
// @route   GET /api/admin/student-analytics
// @access  Private/Admin
// @query   tag - optional filter by tag
// @query   project - optional filter by project
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { tag, project } = req.query;

    // Build match stage for filtering blogs
    const matchStage = {
      status: { $in: ['draft', 'published'] } // Include both draft and published
    };

    // Add tag filter if provided
    if (tag) {
      matchStage.tags = tag;
    }

    // Add project filter if provided
    if (project) {
      matchStage.project = project;
    }

    // Aggregate blog data by author (excluding admin users)
    const analytics = await Blog.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: '$author',
          totalBlogs: { $sum: 1 },
          tags: { $push: '$tags' },
          projects: { $push: '$project' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $match: {
          'userInfo.role': 'student' // Only include students, exclude admins
        }
      },
      {
        $project: {
          _id: 1,
          studentName: '$userInfo.name',
          studentEmail: '$userInfo.email',
          studentRole: '$userInfo.role',
          totalBlogs: 1,
          tags: 1,
          projects: 1
        }
      },
      {
        $sort: { totalBlogs: -1 } // Sort by total blogs descending
      }
    ]);

    // Process the data to get unique tags and projects
    const processedAnalytics = analytics.map(student => {
      // Flatten tags array and get unique values
      const allTags = student.tags.flat().filter(tag => tag && tag.trim() !== '');
      const uniqueTags = [...new Set(allTags)];

      // Get unique projects (filter out null/empty)
      const allProjects = student.projects.filter(project => project && project.trim() !== '');
      const uniqueProjects = [...new Set(allProjects)];

      return {
        studentId: student._id,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        studentRole: student.studentRole,
        totalBlogs: student.totalBlogs,
        tags: uniqueTags,
        projects: uniqueProjects
      };
    });

    // Get all unique tags and projects across all students for filter options
    // (always fetch from unfiltered data for filter dropdown options)
    const allAnalytics = await Blog.aggregate([
      {
        $match: {
          status: { $in: ['draft', 'published'] }
        }
      },
      {
        $group: {
          _id: '$author',
          tags: { $push: '$tags' },
          projects: { $push: '$project' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $match: {
          'userInfo.role': 'student'
        }
      }
    ]);

    const allProcessedAnalytics = allAnalytics.map(student => {
      const allTags = student.tags.flat().filter(tag => tag && tag.trim() !== '');
      const uniqueTags = [...new Set(allTags)];
      const allProjects = student.projects.filter(project => project && project.trim() !== '');
      const uniqueProjects = [...new Set(allProjects)];
      return { tags: uniqueTags, projects: uniqueProjects };
    });

    const allUniqueTags = [...new Set(allProcessedAnalytics.flatMap(s => s.tags))].sort();
    const allUniqueProjects = [...new Set(allProcessedAnalytics.flatMap(s => s.projects))].sort();

    res.status(200).json({
      success: true,
      count: processedAnalytics.length,
      data: processedAnalytics,
      filters: {
        tags: allUniqueTags,
        projects: allUniqueProjects
      },
      activeFilters: {
        tag: tag || null,
        project: project || null
      }
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student analytics',
      error: error.message
    });
  }
};

// @desc    Get filtered blogs for a specific student
// @route   GET /api/admin/student/:studentId/blogs
// @access  Private/Admin
// @query   tag - optional filter by tag
// @query   project - optional filter by project
exports.getStudentBlogs = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tag, project } = req.query;

    // Validate studentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Build match stage for filtering blogs
    const matchStage = {
      author: new mongoose.Types.ObjectId(studentId),
      status: { $in: ['draft', 'published'] }
    };

    // Add tag filter if provided
    if (tag) {
      matchStage.tags = tag;
    }

    // Add project filter if provided
    if (project) {
      matchStage.project = project;
    }

    // Fetch filtered blogs for the student
    const blogs = await Blog.find(matchStage)
      .select('_id title tags project status createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
      filters: {
        tag: tag || null,
        project: project || null
      }
    });
  } catch (error) {
    console.error('Error fetching student blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student blogs',
      error: error.message
    });
  }
};

