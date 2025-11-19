import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usersAPI, authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ResetPasswordModal from '../components/ResetPasswordModal';
import ChangeEmailModal from '../components/ChangeEmailModal';

export default function ManageStudents() {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForActions, setSelectedStudentForActions] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const tableRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideTable = tableRef.current && tableRef.current.contains(event.target);
      const isClickInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      
      if (!isClickInsideTable && !isClickInsideDropdown) {
        setSelectedStudentForActions(null);
      }
    };

    if (selectedStudentForActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedStudentForActions]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getStudents();
      setStudents(response.data.students);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await authAPI.register(newStudent);
      toast.success('Student added successfully!');
      setShowAddModal(false);
      setNewStudent({ name: '', email: '', password: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) {
      return;
    }

    try {
      await usersAPI.deleteStudent(id);
      toast.success('Student removed successfully!');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  const handleResetPassword = (student) => {
    setSelectedStudent({
      id: student._id,
      name: student.name,
      email: student.email,
    });
    setShowResetPasswordModal(true);
  };

  const handleChangeEmail = (student) => {
    setSelectedStudent({
      id: student._id,
      name: student.name,
      email: student.email,
    });
    setShowChangeEmailModal(true);
  };

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  const handleRowClick = (student, event) => {
    if (selectedStudentForActions?._id === student._id) {
      setSelectedStudentForActions(null);
      return;
    }

    // Calculate dropdown position based on the row element
    const row = event.currentTarget;
    const rect = row.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - 200, // 200px is the width of dropdown
    });

    setSelectedStudentForActions(student);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Students</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Students: <span className="font-semibold text-gray-900 dark:text-white">{students.length}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium flex items-center gap-2"
            title="Search by name"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div ref={tableRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-visible">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-8 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
                    No students found
                  </td>
                </tr>
              ) : (
                students
                  .filter((student) =>
                    student.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={(e) => handleRowClick(student, e)}
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{student.email}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(student.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Portal Dropdown - rendered outside table */}
      {selectedStudentForActions && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white dark:bg-gray-700 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '200px',
          }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-600 dark:to-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</p>
          </div>
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetPassword(selectedStudentForActions);
                setSelectedStudentForActions(null);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600 flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div>
                <div className="font-medium">Reset Password</div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChangeEmail(selectedStudentForActions);
                setSelectedStudentForActions(null);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600 flex items-center gap-3 transition-colors border-t border-gray-200 dark:border-gray-600"
            >
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium">Change Email</div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteStudent(selectedStudentForActions._id, selectedStudentForActions.name);
                setSelectedStudentForActions(null);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-gray-600 flex items-center gap-3 transition-colors border-t border-gray-200 dark:border-gray-600"
            >
              <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div>
                <div className="font-medium">Remove Student</div>
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  minLength="6"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewStudent({ name: '', email: '', password: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        student={selectedStudent}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedStudent(null);
        }}
        onSuccess={fetchStudents}
      />

      {/* Change Email Modal */}
      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        student={selectedStudent}
        onClose={() => {
          setShowChangeEmailModal(false);
          setSelectedStudent(null);
        }}
        onSuccess={fetchStudents}
      />
    </div>
  );
}

