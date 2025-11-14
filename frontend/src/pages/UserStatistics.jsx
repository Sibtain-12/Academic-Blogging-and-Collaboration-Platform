import { useState, useEffect, useMemo } from 'react';
import { blogsAPI, usersAPI, commentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function UserStatistics() {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    role: [],
    tags: [],
    projects: [],
  });
  // UI-only toggles for collapsible filters (collapsed by default)
  const [isUSTagsOpen, setIsUSTagsOpen] = useState(false);
  const [isUSProjectsOpen, setIsUSProjectsOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users (both admin and students)
      const usersResponse = await usersAPI.getStudents();
      setUsers(usersResponse.data.students || []);

      // Fetch all blogs
      const blogsResponse = await blogsAPI.getBlogs();
      setBlogs(blogsResponse.data.blogs || []);

      // Fetch all comments for all blogs
      const allComments = [];
      if (blogsResponse.data.blogs) {
        for (const blog of blogsResponse.data.blogs) {
          try {
            const commentsResponse = await commentsAPI.getComments(blog._id);
            allComments.push(...(commentsResponse.data.comments || []));
          } catch (error) {
            // Skip if comments can't be fetched for this blog
          }
        }
      }
      setComments(allComments);
    } catch (error) {
      toast.error('Failed to fetch user statistics data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueTags = useMemo(() => {
    return [...new Set(blogs.flatMap((blog) => blog.tags || []))].sort();
  }, [blogs]);

  const uniqueProjects = useMemo(() => {
    return [...new Set(blogs.map((blog) => blog.project).filter(Boolean))].sort();
  }, [blogs]);

  // Check if project or tags filter is active
  const isProjectOrTagsFilterActive = filters.projects.length > 0 || filters.tags.length > 0;

  // Calculate user statistics
  const userStats = useMemo(() => {
    return users.map((user) => {
      let userBlogs = blogs.filter((blog) => blog.author?._id === user._id);
      let userComments = comments.filter((comment) => comment.author?._id === user._id);
      
      // If project or tags filter is active, calculate filtered blog counts
      let filteredBlogCount = userBlogs.length;
      if (isProjectOrTagsFilterActive) {
        filteredBlogCount = userBlogs.filter((blog) => {
          // Filter by projects (OR logic)
          if (filters.projects.length > 0) {
            const hasMatchingProject = filters.projects.includes(blog.project);
            if (!hasMatchingProject) {
              return false;
            }
          }

          // Filter by tags (OR logic)
          if (filters.tags.length > 0) {
            const hasAtLeastOneTag = filters.tags.some((tag) => blog.tags?.includes(tag));
            if (!hasAtLeastOneTag) {
              return false;
            }
          }

          return true;
        }).length;
      }
      
      return {
        ...user,
        totalBlogs: userBlogs.length,
        filteredBlogs: filteredBlogCount,
        totalComments: userComments.length,
        tags: [...new Set(userBlogs.flatMap((blog) => blog.tags || []))],
        projects: [...new Set(userBlogs.map((blog) => blog.project).filter(Boolean))],
      };
    });
  }, [users, blogs, comments, isProjectOrTagsFilterActive, filters.projects, filters.tags]);

  // Filter user statistics
  const filteredStats = useMemo(() => {
    return userStats.filter((user) => {
      // Filter by name
      if (filters.name && !user.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filter by role
      if (filters.role.length > 0 && !filters.role.includes(user.role)) {
        return false;
      }

      // Filter by tags (OR logic - at least one tag must match)
      if (filters.tags.length > 0) {
        const hasAtLeastOneTag = filters.tags.some((tag) => user.tags.includes(tag));
        if (!hasAtLeastOneTag) {
          return false;
        }
      }

      // Filter by projects (OR logic - at least one project must match)
      if (filters.projects.length > 0) {
        const hasAtLeastOneProject = filters.projects.some((project) => user.projects.includes(project));
        if (!hasAtLeastOneProject) {
          return false;
        }
      }

      return true;
    });
  }, [userStats, filters]);

  const handleRoleToggle = (role) => {
    setFilters((prev) => ({
      ...prev,
      role: prev.role.includes(role)
        ? prev.role.filter((r) => r !== role)
        : [...prev.role, role],
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleProjectToggle = (project) => {
    setFilters((prev) => ({
      ...prev,
      projects: prev.projects.includes(project)
        ? prev.projects.filter((p) => p !== project)
        : [...prev.projects, project],
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      role: [],
      tags: [],
      projects: [],
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can view user statistics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              👥 User Statistics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredStats.length} {filteredStats.length === 1 ? 'user' : 'users'} found
            </p>
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

              {/* Filter by Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>

              {/* Filter by Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  {['admin', 'student'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.role.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter by Tags (collapsible) */}
              {uniqueTags.length > 0 && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setIsUSTagsOpen((o) => !o)}
                    aria-expanded={isUSTagsOpen}
                    aria-controls="us-tags-filter"
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {filters.tags.length > 0 ? `(${filters.tags.length} selected)` : ''}
                    </span>
                    <svg
                      className={`ml-auto h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isUSTagsOpen ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isUSTagsOpen && (
                    <div id="us-tags-filter" className="space-y-2 max-h-40 overflow-y-auto mt-3">
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

              {/* Filter by Project (collapsible) */}
              {uniqueProjects.length > 0 && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setIsUSProjectsOpen((o) => !o)}
                    aria-expanded={isUSProjectsOpen}
                    aria-controls="us-projects-filter"
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project/Category</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {filters.projects.length > 0 ? `(${filters.projects.length} selected)` : ''}
                    </span>
                    <svg
                      className={`ml-auto h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isUSProjectsOpen ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isUSProjectsOpen && (
                    <div id="us-projects-filter" className="space-y-2 max-h-40 overflow-y-auto mt-3">
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

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* User Statistics */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading user statistics...</p>
              </div>
            ) : filteredStats.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {users.length === 0 ? 'No users found' : 'No users match your filters'}
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
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Total Blogs
                        </th>
                        {!isProjectOrTagsFilterActive && (
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                            Total Comments
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Joined On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredStats.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {isProjectOrTagsFilterActive ? user.filteredBlogs : user.totalBlogs}
                            </span>
                          </td>
                          {!isProjectOrTagsFilterActive && (
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {user.totalComments}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(user.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card layout for mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredStats.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {user.name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Email:</span> {user.email}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">📝 Blogs:</span> {isProjectOrTagsFilterActive ? user.filteredBlogs : user.totalBlogs}
                        </p>
                        {!isProjectOrTagsFilterActive && (
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">💬 Comments:</span> {user.totalComments}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">📅 Joined:</span> {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Statistics */}
            {filteredStats.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {filteredStats.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Blogs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {isProjectOrTagsFilterActive 
                      ? filteredStats.reduce((sum, u) => sum + u.filteredBlogs, 0)
                      : filteredStats.reduce((sum, u) => sum + u.totalBlogs, 0)
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

