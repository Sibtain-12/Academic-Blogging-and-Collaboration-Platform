import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function AdminStudentAnalytics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Filter states - initialize from URL query parameters
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get('tag') || '');
  const [selectedProject, setSelectedProject] = useState(() => searchParams.get('project') || '');
  const [availableTags, setAvailableTags] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  useEffect(() => {
    // Fetch analytics with filters from URL on component mount
    const tag = searchParams.get('tag') || '';
    const project = searchParams.get('project') || '';
    setSelectedTag(tag);
    setSelectedProject(project);
    fetchAnalytics(tag, project);
  }, []);

  const fetchAnalytics = async (tag = '', project = '') => {
    try {
      setLoading(true);
      const params = {};
      if (tag) params.tag = tag;
      if (project) params.project = project;

      const response = await adminAPI.getStudentAnalytics(params);
      setAnalytics(response.data.data);
      setFilteredAnalytics(response.data.data);
      setAvailableTags(response.data.filters.tags);
      setAvailableProjects(response.data.filters.projects);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch student analytics');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters - fetch from backend when filters change
  useEffect(() => {
    fetchAnalytics(selectedTag, selectedProject);
  }, [selectedTag, selectedProject]);

  // Sort filtered analytics
  useEffect(() => {
    let sorted = [...filteredAnalytics];
    sorted.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.totalBlogs - a.totalBlogs;
      } else {
        return a.totalBlogs - b.totalBlogs;
      }
    });
    setFilteredAnalytics(sorted);
  }, [sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const clearFilters = () => {
    setSelectedTag('');
    setSelectedProject('');
  };

  const handleStudentClick = (studentId) => {
    // Navigate to student detail view with filter context
    const filterParams = new URLSearchParams();
    if (selectedTag) filterParams.append('tag', selectedTag);
    if (selectedProject) filterParams.append('project', selectedProject);

    navigate(`/admin/student/${studentId}/blogs?${filterParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View blog statistics and activity for all students
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Project/Category
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Projects</option>
                {availableProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium"
            >
              Clear Filters
            </button>
          </div>

          {(selectedTag || selectedProject) && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAnalytics.length} of {analytics.length} students
            </div>
          )}
        </div>

        {/* Table */}
        {filteredAnalytics.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data available</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedTag || selectedProject ? 'No students match the selected filters.' : 'No students have written blogs yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={toggleSortOrder}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-white"
                    >
                      Total Blogs
                      <svg className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tags
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Projects/Categories
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAnalytics.map((student) => (
                  <tr
                    key={student.studentId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleStudentClick(student.studentId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {student.studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {student.studentEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {student.totalBlogs}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.tags.length > 0 ? (
                          student.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.projects.length > 0 ? (
                          student.projects.map((project, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              {project}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No projects</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {filteredAnalytics.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-700 dark:text-gray-300">
                <strong>Total Students:</strong> {filteredAnalytics.length}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <strong>Total Blogs:</strong> {filteredAnalytics.reduce((sum, s) => sum + s.totalBlogs, 0)}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <strong>Average Blogs per Student:</strong> {(filteredAnalytics.reduce((sum, s) => sum + s.totalBlogs, 0) / filteredAnalytics.length).toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

