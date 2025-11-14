import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Users API
export const usersAPI = {
  getStudents: () => api.get('/users'),
  deleteStudent: (id) => api.delete(`/users/${id}`),
  resetStudentPassword: (id, passwordData) => api.put(`/users/${id}/reset-password`, passwordData),
};

// Blogs API
export const blogsAPI = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlog: (id) => api.get(`/blogs/${id}`),
  createBlog: (blogData) => api.post('/blogs', blogData),
  updateBlog: (id, blogData) => api.put(`/blogs/${id}`, blogData),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getDrafts: () => api.get('/blogs/drafts'),
};

// Comments API
export const commentsAPI = {
  getComments: (blogId) => api.get(`/comments/${blogId}`),
  createComment: (commentData) => api.post('/comments', commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getStudentStats: () => api.get('/dashboard/student'),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Admin API
export const adminAPI = {
  getStudentAnalytics: (params) => api.get('/admin/student-analytics', { params }),
  getStudentBlogs: (studentId, params) => api.get(`/admin/student/${studentId}/blogs`, { params }),
};

export default api;

