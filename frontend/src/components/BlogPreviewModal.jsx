import { useAuth } from '../context/AuthContext';

export default function BlogPreviewModal({ isOpen, onClose, blog }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Blog Preview
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
            <div className="max-w-4xl">
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {blog.title || 'Untitled Blog'}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 mb-6">
                <span className="font-medium">{user?.name}</span>
                <span>•</span>
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
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
                  Project: <span className="font-medium">{blog.project}</span>
                </p>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-6" />

              {/* Blog Content */}
              <div className="blog-content prose dark:prose-invert max-w-none">
                {blog.content ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No content yet. Start writing to see the preview...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
