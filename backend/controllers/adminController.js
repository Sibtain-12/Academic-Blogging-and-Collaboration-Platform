const Blog = require('../models/Blog');
const User = require('../models/User');

// @desc    Get student analytics (blog statistics per student, excluding admin)
// @route   GET /api/admin/student-analytics
// @access  Private/Admin
exports.getStudentAnalytics = async (req, res) => {
  try {
    // Aggregate blog data by author (excluding admin users)
    const analytics = await Blog.aggregate([
      {
        $match: {
          status: { $in: ['draft', 'published'] } // Include both draft and published
        }
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
    const allUniqueTags = [...new Set(processedAnalytics.flatMap(s => s.tags))].sort();
    const allUniqueProjects = [...new Set(processedAnalytics.flatMap(s => s.projects))].sort();

    res.status(200).json({
      success: true,
      count: processedAnalytics.length,
      data: processedAnalytics,
      filters: {
        tags: allUniqueTags,
        projects: allUniqueProjects
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

