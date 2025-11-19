# Academic Blogging and Collaboration Platform

A full-stack web application for creating, editing, and collaborating on academic blog posts with rich text editing, mathematical equation support, and multi-format export capabilities.

## 🎯 Project Overview

The Academic Blogging and Collaboration Platform is a modern web application designed for academics and researchers to:
- Create and publish blog posts with rich formatting
- Collaborate with other users on academic content
- Include mathematical equations and complex formatting
- Upload and manage images in the cloud
- Export blog posts to PDF and Word formats
- Manage drafts and published content

---

## ✨ Key Features

### 📝 Blog Management
- **Rich Text Editing**: Quill editor with full formatting support (bold, italic, underline, lists, etc.)
- **Draft & Publish**: Save drafts and publish when ready
- **Edit Published Blogs**: Modify published content anytime
- **Blog Metadata**: Add title, project, tags, and descriptions
- **Timestamp Management**: Separate tracking of creation, publication, and update times
- **Status Tracking**: Draft and published status with proper filtering

### 🧮 Mathematical Support
- **KaTeX Integration**: Full LaTeX equation support
- **Inline & Block Equations**: Display equations inline or as blocks
- **Equation Rendering**: Beautiful mathematical formula rendering

### 🖼️ Image Management
- **AWS S3 Upload**: Upload images directly to AWS S3
- **Image Embedding**: Insert images into blog content
- **Cloud Storage**: All images stored securely in AWS S3

### 📤 Export Functionality
- **PDF Export**: Export blog posts to PDF with formatting and images
- **Word Export**: Export to .docx format with full formatting
- **Table Support**: Export tables with proper formatting
- **Image Preservation**: Images embedded in exported files

### 👥 User Management & Admin Features
- **User Authentication**: Secure login and JWT-based authentication
- **Role-Based Access**: Admin and Student roles with different permissions
- **Student Management**: Admin can create, view, and manage students
- **Password Reset**: Admin can reset student passwords
- **Email Change**: Admin can change student email addresses
- **User Profiles**: Manage user information

### 📧 Email Notifications System
- **Student Creation Emails**: Automatic welcome email with login credentials when admin creates student
- **Blog Publication Emails**: Notify all users when a blog is published
- **Comment Notifications**: Notify users when comments are added to published blogs
- **Secure Credentials**: Student credentials sent via email with security instructions
- **Multi-Provider Support**: Gmail, SendGrid, or custom SMTP support
- **Non-blocking Delivery**: Async email sending doesn't delay API responses

### 📊 Dashboard & Analytics
- **Student Dashboard**: View personal blogs with statistics
- **Admin Dashboard**: View platform-wide statistics and user analytics
- **Blog Statistics**: Track blog count, comments, and engagement
- **User Statistics**: Admin can view individual student analytics

### 🗑️ Data Management
- **Cascade Deletion**: Deleting a student automatically removes their blogs and comments
- **Data Integrity**: Maintains referential integrity across database
- **Orphan Prevention**: No orphaned records in database

### 🎨 UI/UX Features
- **Dark Mode Support**: Complete dark theme support across the platform
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Clean Navigation**: Intuitive navigation with navbar
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages and validation
- **Toast Notifications**: Real-time feedback for user actions

### 🔍 Search & Filtering
- **Student Search**: Admin can search students by name
- **Blog Filtering**: Filter blogs by status, tags, and projects
- **Recent Blogs**: View recently published blogs

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: Role-based access control
- **Admin-Only Actions**: Certain actions restricted to admins
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: Login endpoint rate limiting
- **Environment Variables**: Sensitive data in .env files

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Quill 2.0.3**: Rich text editor
- **quill-better-table 1.2.10**: Table support for Quill
- **KaTeX 0.16.25**: LaTeX equation rendering
- **html2pdf.js 0.12.1**: HTML to PDF conversion
- **docx 9.5.1**: Word document generation
- **file-saver 2.0.5**: File download functionality
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Node.js**: JavaScript runtime
- **Express 5.1.0**: Web framework with rate limiting middleware
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM with schema validation
- **JWT (jsonwebtoken)**: Secure token-based authentication
- **bcryptjs**: Password hashing and comparison
- **nodemailer**: Email sending service
- **dotenv**: Environment variable management
- **AWS SDK v2**: AWS S3 integration
- **express-rate-limit**: Rate limiting middleware

### Cloud & Storage
- **AWS S3**: Cloud image storage
- **AWS SDK v2**: S3 client library

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MongoDB** (v4.4 or higher) - local or cloud instance
- **AWS Account** with S3 bucket created
- **Git** for version control

---

## 🚀 Installation Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Create Environment File
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/academic-blog
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/academic-blog

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=academic-blog-images

# Email Configuration (Choose one provider)
# Gmail
EMAIL_SERVICE=gmail
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# OR SendGrid
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your_sendgrid_api_key

# OR Custom SMTP
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-password

# Common Email Settings
EMAIL_FROM=noreply@yourdomain.com
```

#### 2.4 Start Backend Server
```bash
npm run dev
```

Expected output:
```
✅ AWS S3 configured successfully
✅ S3 CORS configured successfully
Server running on port 5000
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Create Environment File
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

#### 3.4 Start Frontend Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for email links | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/academic-blog` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `AWS_ACCESS_KEY_ID` | AWS access key | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | From AWS IAM |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `academic-blog-images` |
| `EMAIL_SERVICE` | Email provider | `gmail`, `sendgrid`, or `smtp` |
| `GMAIL_EMAIL` | Gmail address (if using Gmail) | `your-email@gmail.com` |
| `GMAIL_PASSWORD` | Gmail app password (if using Gmail) | From Gmail settings |
| `SENDGRID_API_KEY` | SendGrid API key (if using SendGrid) | From SendGrid dashboard |
| `SMTP_HOST` | SMTP host (if using SMTP) | `smtp.example.com` |
| `SMTP_PORT` | SMTP port (if using SMTP) | `587` |
| `SMTP_SECURE` | Use TLS (if using SMTP) | `false` or `true` |
| `SMTP_USER` | SMTP username (if using SMTP) | `your-email@example.com` |
| `SMTP_PASSWORD` | SMTP password (if using SMTP) | `your-password` |
| `EMAIL_FROM` | Sender email address | `noreply@yourdomain.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 📖 Running the Application

### Development Mode

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Production Build

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
```

---

## 🔧 AWS S3 CORS Configuration

For image exports to work properly, AWS S3 CORS must be configured.

### Automatic Configuration

The backend automatically configures CORS on startup. Check the console for:
```
✅ S3 CORS configured successfully
```

### Manual Configuration (If Needed)

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Select your bucket: `academic-blog-images`
3. Go to **Permissions** → **CORS**
4. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-version-id"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

---

## 📚 Usage Guide

### Admin Features

#### Managing Students

1. **Navigate to Manage Students**: Click "Manage Students" in the admin menu
2. **Add New Student**:
   - Click "Add Student" button
   - Enter student name, email, and password
   - Student receives welcome email with credentials
   - Student can login immediately
3. **Search Students**: Use search bar to find students by name
4. **Student Actions** (Click on student row):
   - **Reset Password**: Generate and send new password via email
   - **Change Email**: Update student's email address
   - **Remove Student**: Delete student and all their blogs/comments

#### View Analytics

1. **Admin Dashboard**: View platform statistics
2. **Student Analytics**: View individual student's blog count and engagement
3. **Blog Performance**: See published vs draft blog counts

### Creating a Blog Post

1. Click **"Create New Blog"**
2. Enter blog title
3. Add content using the rich text editor
4. Insert images using the image button
5. Add mathematical equations using KaTeX syntax
6. Click **"Save as Draft"** or **"Publish"**

### Uploading Images

1. Click the **image icon** in the editor toolbar
2. Select an image from your computer
3. Image uploads to AWS S3 automatically
4. Image appears in the editor

### Exporting to PDF

1. Open a blog post
2. Click **"PDF"** button
3. PDF downloads with all formatting and images

### Exporting to Word

1. Open a blog post
2. Click **"Word"** button
3. Word document (.docx) downloads with formatting

### Adding Mathematical Equations

Use KaTeX syntax:
- **Inline**: `$E = mc^2$`
- **Block**: `$$\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`

### Email Notifications

The platform automatically sends emails for:

1. **Student Creation**: 
   - Email sent when admin creates new student
   - Includes login credentials and welcome message
   - Link to login page provided

2. **Blog Published**:
   - Email sent to all users when blog is published
   - Includes blog title and link to view
   - Only sent when status changes from draft to published

3. **Comment Added**:
   - Email sent to all users when comment is added to published blog
   - Includes blog title and link to view
   - Notifies author and other users about engagement

**Setting Up Email**:
- Configure one email provider (Gmail, SendGrid, or SMTP) in `.env`
- Emails are sent asynchronously (non-blocking)
- Email failures don't prevent main operation

---

## 🐛 Troubleshooting

### Issue: Images Not Showing in PDF/Word Exports

**Cause**: CORS policy blocking image requests

**Solution**:
1. Restart backend: `npm run dev`
2. Check console for: `✅ S3 CORS configured successfully`
3. Hard refresh frontend: `Ctrl+Shift+R`
4. Test export again

**Manual Fix**:
- Configure CORS manually in AWS S3 console (see AWS S3 CORS Configuration section)

### Issue: Emails Not Sending

**Cause**: Email service not configured or credentials incorrect

**Solution**:
1. Verify email provider is configured in `.env`
2. Check credentials match provider requirements:
   - **Gmail**: Use app-specific password, not account password
   - **SendGrid**: Verify API key is valid
   - **SMTP**: Test connection manually
3. Check email logs in backend console
4. Verify `EMAIL_FROM` and `FRONTEND_URL` are set

**Gmail Setup**:
1. Enable 2-factor authentication
2. Create app-specific password: https://myaccount.google.com/apppasswords
3. Use app password in `GMAIL_PASSWORD`

### Issue: "AWS S3 not configured" Error

**Cause**: Missing AWS credentials in `.env`

**Solution**:
1. Check `.env` file has all AWS variables
2. Verify AWS credentials are correct
3. Restart backend

### Issue: MongoDB Connection Error

**Cause**: MongoDB not running or wrong connection string

**Solution**:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. For MongoDB Atlas, verify IP whitelist includes your IP

### Issue: Images Upload Fails

**Cause**: AWS S3 permissions or bucket configuration

**Solution**:
1. Verify AWS credentials have S3 permissions
2. Check bucket name is correct
3. Ensure bucket exists in correct region

### Issue: Null Reference Error on Deleted Student's Blog

**Cause**: Orphaned blogs from deleted students (should not occur with v2.0+)

**Solution**:
1. Update to latest version (student deletion now cascades)
2. Manually delete orphaned blogs via MongoDB
3. Check frontend has null-safety checks for author

### Issue: Admin Actions (Reset Password, Change Email) Not Working

**Cause**: Click-outside listener closing dropdown before action completes

**Solution**:
1. Update to latest version with portal rendering fix
2. Ensure dropdownRef is properly attached
3. Check browser console for errors

### Issue: Student Not Receiving Welcome Email

**Cause**: Email service error or configuration issue

**Solution**:
1. Check backend console logs for email errors
2. Verify email configuration in `.env`
3. Check student email address is valid
4. Verify email is not in spam folder
5. Check email provider's sending limits

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student (admin only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get all students (admin only)
- `DELETE /api/users/:id` - Delete student (admin only)
- `PUT /api/users/:id/reset-password` - Reset student password (admin only)
- `PUT /api/users/:id/change-email` - Change student email (admin only)

### Blogs
- `GET /api/blogs` - Get all published blogs
- `GET /api/blogs/drafts` - Get user's draft blogs
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/:id` - Get blog by ID
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Comments
- `GET /api/comments/:blogId` - Get comments for blog
- `POST /api/comments` - Add comment to blog
- `DELETE /api/comments/:id` - Delete comment

### Dashboard
- `GET /api/dashboard/admin` - Get admin statistics (admin only)
- `GET /api/dashboard/student` - Get student statistics

### Admin Analytics
- `GET /api/admin/student-analytics` - Get student analytics (admin only)
- `GET /api/admin/student/:studentId/blogs` - Get student's blogs (admin only)

### File Upload
- `POST /api/upload` - Upload image to S3

---

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions, please:
1. Check the Troubleshooting section
2. Review existing issues on GitHub
3. Create a new issue with detailed description

---

## 🎉 Getting Started

1. **Install dependencies** for both frontend and backend
2. **Configure environment variables** (especially AWS S3)
3. **Start MongoDB** (if using local instance)
4. **Run backend**: `npm run dev` (from backend directory)
5. **Run frontend**: `npm run dev` (from frontend directory)
6. **Open browser**: http://localhost:5173
7. **Create account** and start blogging!

---

## 📊 Project Structure

```
academic-blogging-platform/
├── backend/
│   ├── config/
│   │   ├── aws.js                 # AWS S3 configuration
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Authentication and registration
│   │   ├── blogController.js      # Blog CRUD operations
│   │   ├── commentController.js   # Comment management
│   │   ├── dashboardController.js # Dashboard statistics
│   │   ├── userController.js      # User management (admin)
│   │   ├── uploadController.js    # Image upload to S3
│   │   └── adminController.js     # Admin analytics
│   ├── models/
│   │   ├── User.js                # User schema with roles
│   │   ├── Blog.js                # Blog schema with timestamps
│   │   └── Comment.js             # Comment schema
│   ├── routes/
│   │   ├── auth.js                # Auth routes
│   │   ├── blogs.js               # Blog routes
│   │   ├── comments.js            # Comment routes
│   │   ├── users.js               # User management routes
│   │   ├── dashboard.js           # Dashboard routes
│   │   ├── admin.js               # Admin routes
│   │   └── upload.js              # Upload routes
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication & authorization
│   │   ├── error.js               # Error handling
│   │   └── upload.js              # File upload middleware
│   ├── services/
│   │   └── emailService.js        # Email notifications
│   ├── utils/
│   │   └── generateToken.js       # JWT token generation
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Main layout with navbar
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   ├── Loading.jsx        # Loading component
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── ResetPasswordModal.jsx   # Reset password modal
│   │   │   ├── ChangeEmailModal.jsx    # Change email modal
│   │   │   └── FindReplaceModal.jsx    # Find/replace in editor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── ThemeContext.jsx   # Dark/light theme
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Home page with blog list
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── BlogDetail.jsx     # Blog detail and comments
│   │   │   ├── BlogEditor.jsx     # Blog editor with Quill
│   │   │   ├── Dashboard.jsx      # Student dashboard
│   │   │   ├── ManageStudents.jsx # Admin student management
│   │   │   ├── AdminBlogDetail.jsx # Admin blog view
│   │   │   └── UserStatistics.jsx # User analytics
│   │   ├── services/
│   │   │   └── api.js             # Centralized API client
│   │   ├── utils/
│   │   │   ├── helpers.js         # Utility functions
│   │   │   └── quillCustomBlots.js # Custom Quill blots
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   ├── App.css                # App styles
│   │   └── index.css              # Global styles
│   ├── .env                       # Environment variables
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── postcss.config.js          # PostCSS config
│   └── package.json
│
├── README.md                      # This file
└── .gitignore
```

---

## 🔄 Workflow

### Blog Creation Workflow

```
1. User clicks "Create New Blog"
   ↓
2. BlogEditor component loads with Quill editor
   ↓
3. User enters title and content
   ↓
4. User uploads images (uploaded to AWS S3)
   ↓
5. User adds mathematical equations (KaTeX)
   ↓
6. User clicks "Save as Draft" or "Publish"
   ↓
7. Blog saved to MongoDB
   ↓
8. Blog appears in user's blog list
```

### Export Workflow

```
1. User opens published blog
   ↓
2. User clicks "PDF" or "Word" button
   ↓
3. Frontend processes blog content
   ↓
4. Images converted to base64 (CORS required)
   ↓
5. HTML converted to PDF/Word format
   ↓
6. File downloaded to user's computer
```

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data in .env files
- **AWS S3 Security**: Credentials stored securely

---

## 📈 Performance Considerations

- **Vite**: Fast development and production builds
- **React 18**: Optimized rendering with concurrent features
- **AWS S3**: Scalable cloud storage
- **MongoDB Indexing**: Optimized database queries
- **Image Optimization**: JPEG compression for exports

---

## 🚀 Deployment

### Backend Deployment (Heroku Example)

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

---

## 📚 Additional Resources

- [Quill Editor Documentation](https://quilljs.com/)
- [KaTeX Documentation](https://katex.org/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)

---

**Happy Blogging! 🚀**

