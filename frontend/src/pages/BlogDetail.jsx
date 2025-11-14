import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogsAPI, commentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatRelativeTime, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import 'quill/dist/quill.snow.css';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await blogsAPI.getBlog(id);
      setBlog(response.data.blog);
    } catch (error) {
      toast.error('Failed to fetch blog');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments(id);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await commentsAPI.createComment({ blogId: id, text: newComment });
      setNewComment('');
      fetchComments();
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.deleteComment(commentId);
      fetchComments();
      toast.success('Comment deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteBlog = async () => {
    try {
      await blogsAPI.deleteBlog(id);
      toast.success('Blog deleted successfully!');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const canEditBlog = blog && (blog.author._id === user?.id || isAdmin);
  const canDeleteBlog = blog && (blog.author._id === user?.id || isAdmin);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{blog.title}</h1>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
              <span className="font-medium">{blog.author?.name}</span>
              <span>•</span>
              <span>Published {formatDate(blog.createdAt)}</span>
              {blog.updatedAt !== blog.createdAt && (
                <>
                  <span>•</span>
                  <span>Updated {formatRelativeTime(blog.updatedAt)}</span>
                </>
              )}
            </div>
          </div>
          {canEditBlog && (
            <div className="flex gap-2">
              <Link
                to={`/edit/${blog._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Edit
              </Link>
              {canDeleteBlog && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

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

        {blog.project && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Project: <span className="font-medium">{blog.project}</span>
          </p>
        )}

        <div
          className="blog-content prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
          <button
            type="submit"
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Comment
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => {
              const canDeleteComment =
                comment.author._id === user?.id ||
                blog.author._id === user?.id ||
                isAdmin;

              return (
                <div
                  key={comment._id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.author?.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium ml-4"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Delete Blog
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this blog? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteBlog}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

