import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, commentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlogComments, setSelectedBlogComments] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [myBlogsFilters, setMyBlogsFilters] = useState({
    status: '',
    title: '',
    projects: [],
    tags: [],
    month: '',
    year: '',
  });
  // UI-only toggles for collapsible filters (collapsed by default)
  const [isMyProjectsOpen, setIsMyProjectsOpen] = useState(false);
  const [isMyTagsOpen, setIsMyTagsOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = isAdmin
        ? await dashboardAPI.getAdminStats()
        : await dashboardAPI.getStudentStats();
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
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

  // Get unique values for My Blogs filters
  const myBlogsUniqueProjects = useMemo(() => {
    return [...new Set((stats?.myBlogs || []).map((blog) => blog.project).filter(Boolean))].sort();
  }, [stats?.myBlogs]);

  const myBlogsUniqueTags = useMemo(() => {
    return [...new Set((stats?.myBlogs || []).flatMap((blog) => blog.tags || []))].sort();
  }, [stats?.myBlogs]);

  const myBlogsUniqueMonths = useMemo(() => {
    const months = new Set();
    (stats?.myBlogs || []).forEach((blog) => {
      const date = new Date(blog.createdAt);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  }, [stats?.myBlogs]);

  const myBlogsUniqueYears = useMemo(() => {
    const years = new Set();
    (stats?.myBlogs || []).forEach((blog) => {
      const date = new Date(blog.createdAt);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort().reverse();
  }, [stats?.myBlogs]);

  // Filter My Blogs based on selected filters
  const filteredMyBlogs = useMemo(() => {
    return (stats?.myBlogs || []).filter((blog) => {
      // Filter by status
      if (myBlogsFilters.status && blog.status !== myBlogsFilters.status) {
        return false;
      }

      // Filter by title
      if (myBlogsFilters.title && !blog.title.toLowerCase().includes(myBlogsFilters.title.toLowerCase())) {
        return false;
      }

      // Filter by projects (OR logic - at least one project must match)
      if (myBlogsFilters.projects.length > 0) {
        const hasMatchingProject = myBlogsFilters.projects.includes(blog.project);
        if (!hasMatchingProject) {
          return false;
        }
      }

      // Filter by tags (OR logic - at least one tag must match)
      if (myBlogsFilters.tags.length > 0) {
        const hasAtLeastOneTag = myBlogsFilters.tags.some((tag) => blog.tags?.includes(tag));
        if (!hasAtLeastOneTag) {
          return false;
        }
      }

      // Filter by month
      if (myBlogsFilters.month) {
        const date = new Date(blog.createdAt);
        const blogMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (blogMonth !== myBlogsFilters.month) {
          return false;
        }
      }

      // Filter by year
      if (myBlogsFilters.year) {
        const date = new Date(blog.createdAt);
        if (date.getFullYear() !== parseInt(myBlogsFilters.year)) {
          return false;
        }
      }

      return true;
    });
  }, [stats?.myBlogs, myBlogsFilters]);

  const handleMyBlogsFilterChange = (e) => {
    const { name, value } = e.target;
    setMyBlogsFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleMyBlogsProjectToggle = (project) => {
    setMyBlogsFilters((prev) => ({
      ...prev,
      projects: prev.projects.includes(project)
        ? prev.projects.filter((p) => p !== project)
        : [...prev.projects, project],
    }));
  };

  const handleMyBlogsTagToggle = (tag) => {
    setMyBlogsFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleClearMyBlogsFilters = () => {
    setMyBlogsFilters({
      status: '',
      title: '',
      projects: [],
      tags: [],
      month: '',
      year: '',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Blogs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBlogs}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedBlogs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draftBlogs}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAdmin ? 'My Comments' : 'Total Comments'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComments}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* My Blogs (Both Admin and Student) - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filter Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
              {(myBlogsFilters.status || myBlogsFilters.title || myBlogsFilters.projects.length > 0 || myBlogsFilters.tags.length > 0 || myBlogsFilters.month || myBlogsFilters.year) && (
                <button
                  onClick={handleClearMyBlogsFilters}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={myBlogsFilters.status}
                onChange={handleMyBlogsFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Title Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                name="title"
                value={myBlogsFilters.title}
                onChange={handleMyBlogsFilterChange}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>

            {/* Month Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                name="month"
                value={myBlogsFilters.month}
                onChange={handleMyBlogsFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All</option>
                {myBlogsUniqueMonths.map((month) => {
                  const [year, monthNum] = month.split('-');
                  const monthName = new Date(year, monthNum - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <option key={month} value={month}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Year Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                name="year"
                value={myBlogsFilters.year}
                onChange={handleMyBlogsFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All</option>
                {myBlogsUniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            {myBlogsUniqueProjects.length > 0 && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsMyProjectsOpen((o) => !o)}
                  aria-expanded={isMyProjectsOpen}
                  aria-controls="dash-myblogs-projects-filter"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-left"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project/Category</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {myBlogsFilters.projects.length > 0 ? `(${myBlogsFilters.projects.length} selected)` : ''}
                  </span>
                  <svg
                    className={`ml-auto h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isMyProjectsOpen ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {isMyProjectsOpen && (
                  <div id="dash-myblogs-projects-filter" className="space-y-2 max-h-40 overflow-y-auto mt-3">
                    {myBlogsUniqueProjects.map((project) => (
                      <label key={project} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={myBlogsFilters.projects.includes(project)}
                          onChange={() => handleMyBlogsProjectToggle(project)}
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

            {/* Tags Filter */}
            {myBlogsUniqueTags.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsMyTagsOpen((o) => !o)}
                  aria-expanded={isMyTagsOpen}
                  aria-controls="dash-myblogs-tags-filter"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-left"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {myBlogsFilters.tags.length > 0 ? `(${myBlogsFilters.tags.length} selected)` : ''}
                  </span>
                  <svg
                    className={`ml-auto h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isMyTagsOpen ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {isMyTagsOpen && (
                  <div id="dash-myblogs-tags-filter" className="space-y-2 max-h-40 overflow-y-auto mt-3">
                    {myBlogsUniqueTags.map((tag) => (
                      <label key={tag} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={myBlogsFilters.tags.includes(tag)}
                          onChange={() => handleMyBlogsTagToggle(tag)}
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
          </div>
        </div>

        {/* Main Content Area - My Blogs */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                📝 My Blogs ({filteredMyBlogs?.length || 0})
              </h2>
            </div>

            {filteredMyBlogs?.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {stats.myBlogs?.length === 0 ? 'No blogs found' : 'No blogs match the selected filters'}
                </p>
              </div>
            ) : (
              <>
                {/* Table for desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Blog Title
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Project/Category
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
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredMyBlogs?.map((blog) => (
                        <tr
                          key={blog._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/blog/${blog._id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              {blog.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {blog.project || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {blog.tags && blog.tags.length > 0 ? (
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
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                            )}
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(blog.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                blog.status === 'published'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              }`}
                            >
                              {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card layout for mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredMyBlogs?.map((blog) => (
                    <Link
                      key={blog._id}
                      to={`/blog/${blog._id}`}
                      className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                          {blog.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                            blog.status === 'published'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}
                        >
                          {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                        </span>
                      </div>

                      {blog.project && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-medium">📂 Project:</span> {blog.project}
                        </p>
                      )}

                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
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

                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>📅 {formatDate(blog.createdAt)}</span>
                        {blog.commentCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              fetchComments(blog._id);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            💬 {blog.commentCount}
                          </button>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
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

