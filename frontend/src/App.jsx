import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import BlogEditor from './pages/BlogEditor';
import Dashboard from './pages/Dashboard';
import ManageStudents from './pages/ManageStudents';
import AdminBlogDetail from './pages/AdminBlogDetail';
import UserStatistics from './pages/UserStatistics';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="blog/:id" element={<BlogDetail />} />
        <Route path="write" element={<BlogEditor />} />
        <Route path="edit/:id" element={<BlogEditor />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin/students" element={<ManageStudents />} />
        <Route path="admin/student/:studentId/blog/:blogId" element={<AdminBlogDetail />} />
        <Route path="user-statistics" element={<UserStatistics />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
