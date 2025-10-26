import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function AdminStudentBlogsDetail() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  
  // Get filter parameters from URL
  const filterTag = searchParams.get('tag');
  const filterProject = searchParams.get('project');

  useEffect(() => {
    fetchStudentBlogs();
  }, [studentId, filterTag, filterProject]);

  const fetchStudentBlogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTag) params.tag = filterTag;
      if (filterProject) params.project = filterProject;
      
      const response = await adminAPI.getStudentBlogs(studentId, params);
      setBlogs(response.data.data);
      
      // Extract student name from first blog or set default
      if (response.data.data.length > 0) {
        // We'll get the name from the analytics data
        fetchStudentName();
      }
    } catch (error) {
      console.error('Error fetching student blogs:', error);
      toast.error('Failed to fetch student blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentName = async () => {
    try {
      // Fetch analytics to get student name
      const response = await adminAPI.getStudentAnalytics({});
      const student = response.data.data.find(s => s.studentId === studentId);
      if (student) {
        setStudentName(student.studentName);
      }
    } catch (error) {
      console.error('Error fetching student name:', error);
    }
  };

  const getFilterDescription = () => {
    const filters = [];
    if (filterTag) filters.push(`Tag: ${filterTag}`);
    if (filterProject) filters.push(`Project: ${filterProject}`);
    return filters.length > 0 ? filters.join(' • ') : 'All blogs';
  };

  const getAnalyticsUrl = () => {
    // Build URL with filter parameters preserved
    const params = new URLSearchParams();
    if (filterTag) params.append('tag', filterTag);
    if (filterProject) params.append('project', filterProject);
    const queryString = params.toString();
    return `/admin/student-analytics${queryString ? '?' + queryString : ''}`;
  };

  const handleBlogClick = (blogId) => {
    // Navigate to blog detail view with filter context preserved
    const params = new URLSearchParams();
    if (filterTag) params.append('tag', filterTag);
    if (filterProject) params.append('project', filterProject);

    navigate(`/admin/student/${studentId}/blog/${blogId}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(getAnalyticsUrl())}
              className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Analytics
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {studentName || 'Student'} - Blogs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getFilterDescription()}
            </p>
          </div>
        </div>

        {/* Blogs List */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No blogs found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filterTag || filterProject ? 'No blogs match the selected filters.' : 'This student has not written any blogs yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                onClick={() => handleBlogClick(blog._id)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {blog.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    blog.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {blog.project && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {blog.project}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Created: {new Date(blog.createdAt).toLocaleDateString()}</p>
                  {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                    <p>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {blogs.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Total Blogs:</strong> {blogs.length}
              {(filterTag || filterProject) && (
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  (matching {filterTag ? `tag: ${filterTag}` : ''} {filterProject ? `project: ${filterProject}` : ''})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

