import { useState } from 'react';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function ChangeEmailModal({ isOpen, student, onClose, onSuccess }) {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setNewEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === student.email.toLowerCase()) {
      setError('New email must be different from current email');
      return;
    }

    setLoading(true);
    try {
      await usersAPI.changeStudentEmail(student.id, {
        newEmail: newEmail.toLowerCase(),
      });

      toast.success(`Email changed successfully for ${student.name}!`);
      setNewEmail('');
      setError('');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change email';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewEmail('');
    setError('');
    onClose();
  };

  if (!isOpen || !student) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Student Email</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {student.name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Current Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Email
            </label>
            <input
              type="email"
              value={student.email}
              disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-lg cursor-not-allowed"
            />
          </div>

          {/* New Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={handleChange}
              placeholder="Enter new email address"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-semibold">Note:</span> The old email will no longer be usable and will not be associated with this account.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Changing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Change Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
