import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { blogsAPI, usersAPI, commentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    projects: [],
    tags: [],
    month: '',
    year: '',
  });
  // UI-only toggles for collapsible filters (collapsed by default)
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [selectedBlogComments, setSelectedBlogComments] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Restore filters from URL query parameters
    const params = new URLSearchParams(location.search);
    const restoredFilters = {
      title: params.get('title') || '',
      author: params.get('author') || '',
      projects: params.get('projects') ? params.get('projects').split(',') : [],
      tags: params.get('tags') ? params.get('tags').split(',') : [],
      month: params.get('month') || '',
      year: params.get('year') || '',
    };
    setFilters(restoredFilters);

    fetchBlogs();
    if (isAdmin) {
      fetchStudents();
    }
  }, [location.search]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getBlogs();
      setBlogs(response.data.blogs || []);
    } catch (error) {
      toast.error('Failed to fetch blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await usersAPI.getStudents();
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  const fetchComments = async (blogId) => {
    try {
      setCommentsLoading(true);
      const response = await commentsAPI.getComments(blogId);
      setSelectedBlogComments({
        blogId,
        comments: response.data.comments || [],
      });
    } catch (error) {
      toast.error('Failed to fetch comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueProjects = useMemo(() => {
    return [...new Set(blogs.map((blog) => blog.project).filter(Boolean))].sort();
  }, [blogs]);

  const uniqueTags = useMemo(() => {
    return [...new Set(blogs.flatMap((blog) => blog.tags || []))].sort();
  }, [blogs]);

  const uniqueMonths = useMemo(() => {
    const months = new Set();
    blogs.forEach((blog) => {
      const date = new Date(blog.createdAt);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  }, [blogs]);

  const uniqueYears = useMemo(() => {
    const years = new Set();
    blogs.forEach((blog) => {
      const date = new Date(blog.createdAt);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort().reverse();
  }, [blogs]);

  // Filter blogs based on selected filters
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Filter by title
      if (filters.title && !blog.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }

      // Filter by author
      if (filters.author && blog.author?._id !== filters.author) {
        return false;
      }

      // Filter by projects (OR logic - at least one project must match)
      if (filters.projects.length > 0) {
        const hasMatchingProject = filters.projects.includes(blog.project);
        if (!hasMatchingProject) {
          return false;
        }
      }

      // Filter by tags (OR logic - at least one tag must match)
      if (filters.tags.length > 0) {
        const hasAtLeastOneTag = filters.tags.some((tag) => blog.tags?.includes(tag));
        if (!hasAtLeastOneTag) {
          return false;
        }
      }

      // Filter by month
      if (filters.month) {
        const date = new Date(blog.createdAt);
        const blogMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (blogMonth !== filters.month) {
          return false;
        }
      }

      // Filter by year
      if (filters.year) {
        const date = new Date(blog.createdAt);
        if (date.getFullYear() !== parseInt(filters.year)) {
          return false;
        }
      }

      return true;
    });
  }, [blogs, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleProjectToggle = (project) => {
    setFilters((prev) => {
      const newProjects = prev.projects.includes(project)
        ? prev.projects.filter((p) => p !== project)
        : [...prev.projects, project];
      const newFilters = { ...prev, projects: newProjects };
      updateURL(newFilters);
      return newFilters;
    });
  };

  const handleTagToggle = (tag) => {
    setFilters((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      const newFilters = { ...prev, tags: newTags };
      updateURL(newFilters);
      return newFilters;
    });
  };

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.title) params.set('title', newFilters.title);
    if (newFilters.author) params.set('author', newFilters.author);
    if (newFilters.projects.length > 0) params.set('projects', newFilters.projects.join(','));
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
    if (newFilters.month) params.set('month', newFilters.month);
    if (newFilters.year) params.set('year', newFilters.year);

    const queryString = params.toString();
    navigate(`/home${queryString ? '?' + queryString : ''}`, { replace: true });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      title: '',
      author: '',
      projects: [],
      tags: [],
      month: '',
      year: '',
    };
    setFilters(clearedFilters);
    navigate('/home', { replace: true });
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📚 Recent Blog Posts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'} found
              </p>
            </div>
            <Link
              to="/write"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              ✍️ Write New Blog
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔍 Filters
              </h2>

              {/* Filter by Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blog Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                  placeholder="Search title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>

              {/* Filter by Author */}
              {students.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Author
                  </label>
                  <select
                    name="author"
                    value={filters.author}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Authors</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filter by Project (collapsible) */}
              {uniqueProjects.length > 0 && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setIsProjectsOpen((o) => !o)}
                    aria-expanded={isProjectsOpen}
                    aria-controls="home-projects-filter"
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project/Category
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {filters.projects.length > 0 ? `(${filters.projects.length} selected)` : ''}
                    </span>
                    <svg
                      className={`ml-auto h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isProjectsOpen ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isProjectsOpen && (
                    <div id="home-projects-filter" className="space-y-2 max-h-40 overflow-y-auto mt-3">
                      {uniqueProjects.map((project) => (
                        <label key={project} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.projects.includes(project)}
                            onChange={() => handleProjectToggle(project)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {project}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Filter by Tags (collapsible) */}
              {uniqueTags.length > 0 && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setIsTagsOpen((o) => !o)}
                    aria-expanded={isTagsOpen}
                    aria-controls="home-tags-filter"
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {filters.tags.length > 0 ? `(${filters.tags.length} selected)` : ''}
                    </span>
                    <svg
                      className={`ml-auto h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isTagsOpen ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isTagsOpen && (
                    <div id="home-tags-filter" className="space-y-2 max-h-40 overflow-y-auto mt-3">
                      {uniqueTags.map((tag) => (
                        <label key={tag} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.tags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {tag}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Filter by Month */}
              {uniqueMonths.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Months</option>
                    {uniqueMonths.map((month) => {
                      const [year, monthNum] = month.split('-');
                      const date = new Date(year, parseInt(monthNum) - 1);
                      return (
                        <option key={month} value={month}>
                          {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Filter by Year */}
              {uniqueYears.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Blog List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading blogs...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {blogs.length === 0 ? 'No blogs published yet' : 'No blogs match your filters'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Table for desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Blog Title
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Tags
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Comments
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Published Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredBlogs.map((blog) => (
                        <tr
                          key={blog._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => (window.location.href = `/blog/${blog._id}`)}
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/blog/${blog._id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium line-clamp-2"
                            >
                              {blog.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {blog.author?.name}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {blog.author?.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {blog.project || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {blog.tags && blog.tags.length > 0 ? (
                                blog.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  No tags
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {blog.commentCount > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchComments(blog._id);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                              >
                                💬 {blog.commentCount}
                              </button>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {formatDate(blog.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card layout for mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredBlogs.map((blog) => (
                    <Link
                      key={blog._id}
                      to={`/blog/${blog._id}`}
                      className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {blog.author?.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {blog.author?.email}
                          </p>
                        </div>
                        {blog.project && (
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Project:</span> {blog.project}
                          </p>
                        )}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {blog.commentCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              fetchComments(blog._id);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                          >
                            💬 {blog.commentCount} {blog.commentCount === 1 ? 'comment' : 'comments'}
                          </button>
                        )}
                        <p className="text-gray-600 dark:text-gray-400">
                          {formatDate(blog.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {selectedBlogComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                💬 Comments ({selectedBlogComments.comments.length})
              </h3>
              <button
                onClick={() => setSelectedBlogComments(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {commentsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading comments...</p>
                </div>
              ) : selectedBlogComments.comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments yet
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedBlogComments.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {comment.author?.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {comment.author?.email}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

