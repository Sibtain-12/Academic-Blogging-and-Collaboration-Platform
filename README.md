# Academic Blogging and Collaboration Platform

A comprehensive full-stack web application designed for academic writing and collaboration. Enables professors (Admin) and students to create, share, and comment on academic documents with advanced formatting capabilities including LaTeX formulas, tables, custom fonts, and export to PDF/Word.

Built with React, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Default Admin Credentials](#default-admin-credentials)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Known Issues](#known-issues)
- [Recent Changes](#recent-changes)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎓 Project Overview

The Academic Blogging and Collaboration Platform is a sophisticated web application tailored for academic writing. It provides a rich text editor with advanced features specifically designed for academic content creation, including:

- **Advanced Text Formatting**: 7 custom fonts, 13 font sizes, superscript/subscript for citations
- **Mathematical Equations**: LaTeX formula support via KaTeX
- **Tables**: Full table support with insert, delete, merge operations via quill-better-table
- **Document Export**: Export to PDF and Word (.docx) formats
- **Collaboration**: Comments system for peer review and discussion
- **Role-Based Access**: Separate dashboards and permissions for admins and students
- **Document Management**: Draft/publish workflow, auto-save, tags, and project categorization

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (Admin and Student roles)
- Admin-only student registration
- Protected routes and API endpoints
- Session persistence with localStorage

### 📝 Advanced Academic Editor
The platform features a comprehensive academic writing editor with:

#### Text Formatting
- **Custom Fonts**: Arial, Times New Roman, Calibri, Georgia, Comic Sans, Courier New, Verdana
- **Custom Sizes**: 13 size options from 8px to 72px
- **Text Styles**: Bold, italic, underline, strikethrough
- **Superscript/Subscript**: Essential for citations, footnotes, and chemical formulas
- **Colors**: Text color and background highlighting
- **Alignment**: Left, center, right, justify

#### Academic Features
- **LaTeX Formulas**: Mathematical equation support via KaTeX integration
- **Tables**: Full table support with quill-better-table
  - Insert/delete rows and columns
  - Merge/unmerge cells
  - Right-click context menu for table operations
- **Code Blocks**: Syntax highlighting for code snippets
- **Blockquotes**: For citations and references
- **Lists**: Multi-level numbered and bullet lists with indentation

#### Document Tools
- **Page Breaks**: Insert page breaks for document structure
- **Section Breaks**: Separate document sections
- **Find & Replace**: Search and replace text with case-sensitive option (Ctrl+F)
- **Image Upload**: Upload and insert images with resizing capability
- **Links & Media**: Insert hyperlinks, images, videos
- **Document Statistics**: Real-time word count, character count, and reading time

#### Export Functionality
- **Export to PDF**: Generate PDF documents with html2pdf.js
- **Export to Word**: Create .docx files with proper formatting via docx library
- Preserve formatting, images, and structure in exports

### 📚 Blog Management
- Draft and publish workflow
- Auto-save feature (every 30 seconds)
- Tags and project categorization
- Edit and delete own blogs
- Search and filter blogs by author, project, tags, date range, and keywords
- Image upload with local file storage

### 💬 Comments System
- Add comments on published blogs
- Delete own comments
- Blog authors can delete comments on their blogs
- Admin can delete any comment
- Real-time comment count display

### 📊 Dashboard
- **Admin Dashboard**:
  - Total blogs, comments, and students count
  - Recent blogs overview
  - System-wide statistics
- **Student Dashboard**:
  - Personal blog count
  - Comments received on own blogs
  - List of own blogs with status
  - Personal statistics

### 🎨 Additional Features
- Light/Dark mode toggle with persistence
- Fully responsive design (mobile, tablet, desktop)
- Toast notifications for all actions
- Loading states and error handling
- Confirmation dialogs for destructive actions
- Keyboard shortcuts (Ctrl+S for save, Ctrl+F for find)

## 🛠 Technology Stack

### Frontend Technologies

#### Core Framework
- **React**: v18.3.1 - Modern UI library with hooks
- **Vite**: v5.4.11 - Fast build tool and dev server
- **React Router DOM**: v7.9.4 - Client-side routing

#### Styling
- **Tailwind CSS**: v3.4.1 - Utility-first CSS framework
- **PostCSS**: v8.5.6 - CSS processing
- **Autoprefixer**: v10.4.21 - CSS vendor prefixing

#### Rich Text Editor & Academic Features
- **Quill**: v2.0.3 - Core rich text editor (vanilla implementation)
- **quill-better-table**: v1.2.10 - Advanced table support
- **KaTeX**: v0.16.25 - LaTeX mathematical formula rendering
- **html2pdf.js**: v0.12.1 - PDF export functionality
- **docx**: v9.5.1 - Word document (.docx) generation
- **file-saver**: v2.0.5 - File download utility

#### State & HTTP
- **React Context API**: Global state management (Auth, Theme)
- **Axios**: v1.12.2 - HTTP client for API requests
- **React Toastify**: v11.0.5 - Toast notifications

#### Development Tools
- **ESLint**: v9.38.0 - Code linting
- **@vitejs/plugin-react**: v4.3.4 - React support for Vite

### Backend Technologies

#### Core Framework
- **Node.js**: v18.17.1+ - JavaScript runtime
- **Express.js**: v5.1.0 - Web application framework
- **Mongoose**: v8.19.1 - MongoDB ODM

#### Authentication & Security
- **jsonwebtoken**: v9.0.2 - JWT token generation and verification
- **bcryptjs**: v3.0.2 - Password hashing
- **express-rate-limit**: v8.1.0 - Rate limiting middleware
- **cors**: v2.8.5 - Cross-origin resource sharing

#### File Upload & Storage
- **Multer**: v2.0.2 - Multipart form data handling
- **Cloudinary**: v2.7.0 - Cloud image storage (optional)
- **Local File Storage**: Images stored in `backend/uploads/` directory

#### Validation & Utilities
- **express-validator**: v7.2.1 - Request validation
- **dotenv**: v17.2.3 - Environment variable management

#### Development Tools
- **nodemon**: v3.1.10 - Auto-restart on file changes

### Database
- **MongoDB**: v4.4+ - NoSQL document database
- **Mongoose ODM**: Schema-based data modeling

### Key Library Versions Summary

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI Framework |
| Quill | 2.0.3 | Rich Text Editor (Vanilla) |
| quill-better-table | 1.2.10 | Table Support |
| KaTeX | 0.16.25 | LaTeX Formulas |
| html2pdf.js | 0.12.1 | PDF Export |
| docx | 9.5.1 | Word Export |
| Express | 5.1.0 | Backend Framework |
| Mongoose | 8.19.1 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17.1 or higher, v20+ recommended) - [Download](https://nodejs.org/)
  - **Note**: The application works with Node.js v18.17.1 but some packages show compatibility warnings. For best experience, use Node.js v20+
  - Verify installation: `node --version`

- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Can be installed locally or use MongoDB Atlas (cloud)
  - Verify installation: `mongod --version`

- **npm** (v10.1.0 or higher) - Comes with Node.js
  - Verify installation: `npm --version`

- **Git** (optional, for cloning) - [Download](https://git-scm.com/)

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for dependencies and uploads

## 🚀 Installation

### Clone the Repository

```bash
git clone <repository-url>
cd academic-blog-platform
```

Or download and extract the ZIP file.

### Step 1: Start MongoDB

Ensure MongoDB is running on your system:

**Windows (if installed as service)**:
```cmd
net start MongoDB
```

**Windows (manual start)**:
```cmd
mongod
```

**macOS/Linux**:
```bash
# Using Homebrew (macOS)
brew services start mongodb-community

# Or manual start
mongod
```

**Verify MongoDB is running**:
```bash
# Should connect successfully
mongosh
# or
mongo
```

### Step 2: Start Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm run dev
```

**Expected output**:
```
Server running on port 5000
MongoDB Connected: localhost
```

The backend server will be available at `http://localhost:5000`

**Available backend scripts**:
- `npm run dev` - Start with nodemon (auto-restart on changes)
- `npm start` - Start in production mode
- `npm run seed` - Seed database with admin user

### Step 3: Start Frontend Development Server

Open a **new terminal** (keep backend running) and navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

**Expected output**:
```
VITE v5.4.11  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

The frontend will be available at `http://localhost:5173`

**Available frontend scripts**:
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Step 5: Login with Admin Credentials

Use the default admin credentials to log in:
- **Email**: `admin@academic.com`
- **Password**: `Admin@123`

### Quick Start Summary

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (new terminal)
cd frontend
npm run dev

# Browser
# Navigate to http://localhost:5173
# Login with admin@academic.com / Admin@123
```

## 🔑 Default Admin Credentials

The seeded admin account credentials are:

| Field | Value |
|-------|-------|
| **Email** | `admin@academic.com` |
| **Password** | `Admin@123` |
| **Role** | Admin |
| **Name** | Admin User |

### Admin Capabilities

After logging in as admin, you can:
- ✅ **Add new students** - Register student accounts
- ✅ **View all blogs** - Access all published and draft blogs
- ✅ **View statistics** - System-wide analytics on admin dashboard
- ✅ **Manage comments** - Delete any comment on any blog
- ✅ **Manage students** - View and delete student accounts
- ✅ **Full CRUD operations** - Create, read, update, delete all content

### Creating Student Accounts

1. Log in as admin
2. Navigate to "Manage Students" from the navbar
3. Click "Add New Student"
4. Fill in student details (name, email, password)
5. Student can now log in with their credentials

**Note**: Only admins can create student accounts. Students cannot self-register.

## 📁 Project Structure

```
academic-blog-platform/
├── backend/                      # Node.js/Express backend
│   ├── config/
│   │   ├── db.js                 # MongoDB connection configuration
│   │   └── cloudinary.js         # Cloudinary cloud storage config (optional)
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic (login, register)
│   │   ├── blogController.js     # Blog CRUD operations
│   │   ├── commentController.js  # Comment operations
│   │   ├── dashboardController.js # Dashboard statistics
│   │   ├── uploadController.js   # Image upload handling
│   │   └── userController.js     # User management (admin only)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role checking
│   │   ├── error.js              # Global error handling
│   │   └── upload.js             # Multer file upload configuration
│   ├── models/
│   │   ├── User.js               # User schema (admin/student roles)
│   │   ├── Blog.js               # Blog schema (title, content, tags, etc.)
│   │   └── Comment.js            # Comment schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── blogs.js              # Blog routes
│   │   ├── comments.js           # Comment routes
│   │   ├── dashboard.js          # Dashboard routes
│   │   ├── upload.js             # Upload routes
│   │   └── users.js              # User management routes
│   ├── uploads/                  # Local image storage directory
│   ├── utils/
│   │   └── generateToken.js      # JWT token generation utility
│   ├── .env                      # Environment variables (not in repo)
│   ├── .env.example              # Environment template
│   ├── .gitignore                # Git ignore file
│   ├── package.json              # Backend dependencies
│   ├── seed.js                   # Database seeder (creates admin)
│   └── server.js                 # Express server entry point
│
├── frontend/                     # React/Vite frontend
│   ├── public/                   # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Main layout wrapper with navbar
│   │   │   ├── Navbar.jsx        # Navigation bar component
│   │   │   ├── Loading.jsx       # Loading spinner component
│   │   │   ├── ProtectedRoute.jsx # Route protection HOC
│   │   │   └── FindReplaceModal.jsx # Find & Replace modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state & methods
│   │   │   └── ThemeContext.jsx  # Dark mode state & toggle
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Home.jsx          # Blog listing with filters
│   │   │   ├── BlogDetail.jsx    # Single blog view with comments
│   │   │   ├── BlogEditor.jsx    # Academic editor (create/edit)
│   │   │   ├── Dashboard.jsx     # Statistics dashboard
│   │   │   └── ManageStudents.jsx # Admin student management
│   │   ├── services/
│   │   │   └── api.js            # Axios API service layer
│   │   ├── utils/
│   │   │   ├── helpers.js        # Utility functions
│   │   │   └── quillCustomBlots.js # Custom Quill blots (PageBreak, SectionBreak)
│   │   ├── App.jsx               # Main app component with routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles & Quill customizations
│   ├── .env                      # Environment variables (not in repo)
│   ├── .env.example              # Environment template
│   ├── .gitignore                # Git ignore file
│   ├── package.json              # Frontend dependencies
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── vite.config.js            # Vite build configuration
│   ├── eslint.config.js          # ESLint configuration
│   └── index.html                # HTML entry point
│
├── .gitignore                    # Root git ignore
└── README.md                     # This documentation file
```

### Key Files Explained

#### Backend
- **`server.js`**: Express server setup, middleware, routes, MongoDB connection
- **`seed.js`**: Creates default admin user for initial setup
- **`models/`**: Mongoose schemas defining data structure
- **`controllers/`**: Business logic for each feature
- **`middleware/auth.js`**: Protects routes, verifies JWT, checks user roles
- **`routes/`**: API endpoint definitions

#### Frontend
- **`BlogEditor.jsx`**: Advanced academic editor with Quill, tables, LaTeX, export
- **`quillCustomBlots.js`**: Custom Quill formats (page breaks, section breaks)
- **`index.css`**: Global styles including Quill customizations and table styling
- **`api.js`**: Centralized API calls with Axios interceptors
- **`AuthContext.jsx`**: Global authentication state, login/logout methods
- **`ThemeContext.jsx`**: Dark mode state with localStorage persistence

## � Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with these variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port number |
| `NODE_ENV` | No | development | Environment (development/production) |
| `MONGODB_URI` | **Yes** | - | MongoDB connection string |
| `JWT_SECRET` | **Yes** | - | Secret key for JWT tokens (min 32 chars) |
| `JWT_EXPIRE` | No | 7d | JWT token expiration time |
| `CLOUDINARY_CLOUD_NAME` | No | - | Cloudinary cloud name (optional) |
| `CLOUDINARY_API_KEY` | No | - | Cloudinary API key (optional) |
| `CLOUDINARY_API_SECRET` | No | - | Cloudinary API secret (optional) |
| `FRONTEND_URL` | No | http://localhost:5173 | Frontend URL for CORS |

**Example `.env` file**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/academic-blog
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes** | - | Backend API base URL |

**Example `.env` file**:
```env
VITE_API_URL=http://localhost:5000/api
```

**Important Notes**:
- Never commit `.env` files to version control
- Use `.env.example` as a template
- Change `JWT_SECRET` to a strong random string in production
- Cloudinary variables are optional; app uses local storage by default

---

## ⚠️ Known Issues

### 1. Package Dependency Warnings

**Issue**: When running `npm list`, you may see "extraneous" warnings for academic editor packages.

**Cause**: The `package.json` was recently reverted, but `node_modules` still contains the academic editor packages (quill, katex, html2pdf.js, docx, file-saver, quill-better-table).

**Impact**: No functional impact - the application works correctly. The packages are installed and functional.

**Solution**:
```bash
# Option 1: Add packages to package.json manually
cd frontend
npm install quill@^2.0.3 quill-better-table@^1.2.10 katex@^0.16.25 html2pdf.js@^0.12.1 docx@^9.5.1 file-saver@^2.0.5 --save

# Option 2: Ignore the warnings (packages work fine)
```

### 2. React Quill Implementation

**Current State**: The application uses **vanilla Quill** (not react-quill or react-quill-new).

**Details**:
- `BlogEditor.jsx` imports `Quill` directly from `'quill'`
- Uses manual Quill initialization with `new Quill()`
- Does NOT use the `<ReactQuill>` component
- `package.json` lists `react-quill@^2.0.0` but it's not actually used in the code

**Why**: The vanilla Quill implementation provides better control over advanced features like quill-better-table, custom blots, and module registration.

**Impact**: No functional issues. All features work correctly.

### 3. Table Operations with Quill v2.0.3

**Potential Issue**: Some table operations may have compatibility issues with Quill v2.0.3 and quill-better-table v1.2.10.

**Known Problems**:
- Column insertion may throw errors in some cases
- Phantom tables may appear when clicking cells

**Status**: Currently working in the implemented version. If issues arise, consider downgrading to Quill v1.3.7.

**Workaround**: If table issues occur:
```bash
cd frontend
npm uninstall quill
npm install quill@1.3.7
```

### 4. Node.js Version Warnings

**Issue**: Some packages show "EBADENGINE" warnings with Node.js v18.17.1.

**Cause**: Packages like ESLint and React Router prefer Node.js v20+.

**Impact**: Warnings only - application works fine with Node.js v18.17.1.

**Solution**: Upgrade to Node.js v20+ for best compatibility (optional).

---

## 📝 Recent Changes

### Latest Update: Package Reversion

**Date**: Recent

**Changes Made**:
1. **Reverted `frontend/package.json`** to use `react-quill@^2.0.0`
2. **Removed academic editor packages** from package.json (quill, katex, html2pdf.js, docx, file-saver, quill-better-table)
3. **Reverted `BlogEditor.jsx`** to vanilla Quill implementation
4. **Reverted `FindReplaceModal.jsx`** to work with vanilla Quill

**Current State**:
- ✅ Application uses **vanilla Quill v2.0.3** (not ReactQuill)
- ✅ All academic editor features functional (tables, LaTeX, export, etc.)
- ✅ Packages installed in `node_modules` but marked as "extraneous"
- ✅ Code imports from `'quill'` directly, not `'react-quill'` or `'react-quill-new'`

**Why the Reversion**:
The project was previously using `react-quill-new` (a React wrapper for Quill), but was reverted to vanilla Quill for better control over advanced features and module registration.

**Impact**:
- No functional changes - all features work correctly
- Package warnings in `npm list` (can be safely ignored)
- Code uses vanilla Quill API instead of ReactQuill component

### Previous Major Updates

1. **Academic Editor Enhancement**: Added advanced formatting, tables, LaTeX, export features
2. **Table Support**: Integrated quill-better-table for full table operations
3. **Export Functionality**: Added PDF and Word export capabilities
4. **Find & Replace**: Implemented search and replace with keyboard shortcuts
5. **Custom Blots**: Added page breaks and section breaks
6. **Image Resizing**: Implemented image resize handles in editor
7. **Document Statistics**: Added real-time word count, character count, reading time

---

## �📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/register` | Register new student | Admin only |
| GET | `/api/auth/me` | Get current user | Private |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all students | Admin only |
| DELETE | `/api/users/:id` | Delete student | Admin only |

### Blog Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/blogs` | Get all published blogs (with filters) | Private |
| GET | `/api/blogs/:id` | Get single blog | Private |
| POST | `/api/blogs` | Create new blog | Private |
| PUT | `/api/blogs/:id` | Update blog | Author/Admin |
| DELETE | `/api/blogs/:id` | Delete blog | Author/Admin |
| GET | `/api/blogs/drafts` | Get user's draft blogs | Private |

### Comment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/comments/:blogId` | Get all comments for a blog | Private |
| POST | `/api/comments` | Create new comment | Private |
| DELETE | `/api/comments/:id` | Delete comment | Author/Blog Author/Admin |

### Dashboard Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/admin` | Get admin statistics | Admin only |
| GET | `/api/dashboard/student` | Get student statistics | Private |

### Upload Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/upload` | Upload image | Private |

## 🚢 Deployment

### Backend Deployment (Render/Railway)

1. Create a new web service on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set the following environment variables:
   - `MONGODB_URI` (use MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (your frontend URL)
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy!

### Frontend Deployment (Vercel/Netlify)

1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Set root directory to `frontend`
4. Set environment variable:
   - `VITE_API_URL` (your backend URL + /api)
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy!

### MongoDB Atlas Setup

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string and use in `MONGODB_URI`

## � Troubleshooting

### Package Dependency Errors

**Problem**: `npm list` shows "extraneous" warnings for quill, katex, html2pdf.js, docx, file-saver, quill-better-table.

**Solution**:
```bash
cd frontend
npm install quill@^2.0.3 quill-better-table@^1.2.10 katex@^0.16.25 html2pdf.js@^0.12.1 docx@^9.5.1 file-saver@^2.0.5 --save
```

Or simply ignore the warnings - the packages work fine.

---

### Blog Editor Not Loading

**Problem**: White screen or errors when navigating to `/write` page.

**Possible Causes & Solutions**:

1. **Missing Packages**:
   ```bash
   cd frontend
   npm install quill@^2.0.3 quill-better-table@^1.2.10 katex@^0.16.25
   ```

2. **Module Registration Issues**:
   - Check browser console for errors
   - Ensure `quillCustomBlots.js` is present in `src/utils/`
   - Verify Quill modules are registered before component mounts

3. **Import Errors**:
   - Verify imports in `BlogEditor.jsx`:
     ```javascript
     import Quill from 'quill';
     import 'quill/dist/quill.snow.css';
     import QuillBetterTable from 'quill-better-table';
     import 'quill-better-table/dist/quill-better-table.css';
     ```

---

### Table Insertion Not Working

**Problem**: Clicking "Insert Table (3x3)" shows success message but no table appears.

**Solution**: This is a known compatibility issue between Quill v2.0.3 and quill-better-table v1.2.10.

**Workaround - Downgrade to Quill v1.3.7**:
```bash
cd frontend
npm uninstall quill
npm install quill@1.3.7
```

**Note**: Quill v1.3.7 has better compatibility with quill-better-table but is an older version.

---

### Table Column/Row Operations Errors

**Problem**: Console error when inserting columns/rows: `Cannot read properties of undefined (reading 'next')`.

**Cause**: Quill v2.0.3 and quill-better-table v1.2.10 incompatibility.

**Solution**: Downgrade to Quill v1.3.7 (see above).

---

### MongoDB Connection Error

**Problem**: Backend fails to start with MongoDB connection error.

**Solutions**:

1. **Start MongoDB**:
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   brew services start mongodb-community
   # or
   mongod
   ```

2. **Check Connection String**:
   - Verify `MONGODB_URI` in `backend/.env`
   - Default: `mongodb://localhost:27017/academic-blog`

3. **MongoDB Not Installed**:
   - Install MongoDB Community Edition
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

---

### CORS Errors

**Problem**: API requests fail with CORS errors.

**Solutions**:

1. **Check Both Servers Running**:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:5173`

2. **Verify Environment Variables**:
   - Frontend `.env`: `VITE_API_URL=http://localhost:5000/api`
   - Backend `.env`: `FRONTEND_URL=http://localhost:5173`

3. **Check CORS Configuration**:
   - Verify `server.js` has CORS middleware configured

---

### Image Upload Not Working

**Problem**: Image upload fails or shows errors.

**Solutions**:

1. **Using Local Storage** (Default):
   - Ensure `backend/uploads/` directory exists
   - Check file permissions on uploads directory

2. **Using Cloudinary** (Optional):
   - Sign up at https://cloudinary.com
   - Add credentials to `backend/.env`:
     ```env
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

---

### Frontend Won't Start (Vite Error)

**Problem**: Vite fails to start or shows build errors.

**Solutions**:

1. **Node.js Version**:
   - Ensure Node.js v18.17.1 or higher
   - Check: `node --version`
   - Upgrade if needed: https://nodejs.org/

2. **Clear Cache**:
   ```bash
   cd frontend
   rm -rf node_modules .vite
   npm install
   npm run dev
   ```

3. **Port Already in Use**:
   - Vite will automatically use next available port
   - Or kill process using port 5173

---

### CSS Not Loading / Tailwind Errors

**Problem**: Styles not applying or PostCSS errors.

**Solutions**:

1. **Verify Tailwind Version**:
   ```bash
   cd frontend
   npm list tailwindcss
   # Should show v3.4.1
   ```

2. **Reinstall Tailwind** (if needed):
   ```bash
   npm install tailwindcss@3.4.1 postcss@8.5.6 autoprefixer@10.4.21 --save-dev
   ```

3. **Restart Dev Server**:
   ```bash
   npm run dev -- --force
   ```

---

### Port Already in Use

**Problem**: "Port 5000 already in use" or "Port 5173 already in use".

**Solutions**:

1. **Backend (Port 5000)**:
   - Change `PORT` in `backend/.env` to another port (e.g., 5001)
   - Update `VITE_API_URL` in `frontend/.env` accordingly

2. **Frontend (Port 5173)**:
   - Vite will automatically use next available port (5174, 5175, etc.)
   - Or kill the process using the port

3. **Kill Process** (Windows):
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

4. **Kill Process** (macOS/Linux):
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

---

### Node.js Version Warnings

**Problem**: "EBADENGINE" warnings when installing packages.

**Cause**: Some packages prefer Node.js v20+.

**Impact**: Warnings only - application works fine with Node.js v18.17.1.

**Solution** (Optional):
- Upgrade to Node.js v20+ for best compatibility
- Or ignore the warnings

---

### React Strict Mode Warnings

**Problem**: Console warnings about deprecated APIs or double renders.

**Note**: React Strict Mode is intentionally disabled in `main.jsx` for better compatibility with Quill editor.

**This is normal** and does not affect functionality.

---
