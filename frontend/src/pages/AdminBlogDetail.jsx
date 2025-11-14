import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import 'quill/dist/quill.snow.css';

export default function AdminBlogDetail() {
  const { studentId, blogId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get filter parameters from URL
  const filterTag = searchParams.get('tag');
  const filterProject = searchParams.get('project');

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getBlog(blogId);
      setBlog(response.data.blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
      navigate(`/admin/student/${studentId}/blogs`);
    } finally {
      setLoading(false);
    }
  };

  const getBackUrl = () => {
    const params = new URLSearchParams();
    if (filterTag) params.append('tag', filterTag);
    if (filterProject) params.append('project', filterProject);
    const queryString = params.toString();
    return `/admin/student/${studentId}/blogs${queryString ? '?' + queryString : ''}`;
  };

  const getAnalyticsUrl = () => {
    // Build URL with filter parameters preserved
    const params = new URLSearchParams();
    if (filterTag) params.append('tag', filterTag);
    if (filterProject) params.append('project', filterProject);
    const queryString = params.toString();
    return `/admin/student-analytics${queryString ? '?' + queryString : ''}`;
  };

  const getBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <button
          onClick={() => navigate(getAnalyticsUrl())}
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          Analytics
        </button>
        <span>›</span>
        <button
          onClick={() => navigate(getBackUrl())}
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          Student Blogs
        </button>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium">Blog Detail</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      {getBreadcrumbs()}

      {/* Back Button */}
      <button
        onClick={() => navigate(getBackUrl())}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Student Blogs
      </button>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {blog.title}
              </h1>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 flex-wrap">
                <span className="font-medium">{blog.author?.name}</span>
                <span>•</span>
                <span>{formatDate(blog.createdAt)}</span>
                {blog.updatedAt !== blog.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {formatRelativeTime(blog.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                blog.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Project */}
        {blog.project && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span className="font-medium">Project:</span> {blog.project}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        {/* Content */}
        <div
          className="blog-content prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(getBackUrl())}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
        >
          ← Back to Student Blogs
        </button>
        <button
          onClick={() => navigate(getAnalyticsUrl())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Back to Analytics
        </button>
      </div>
    </div>
  );
}

