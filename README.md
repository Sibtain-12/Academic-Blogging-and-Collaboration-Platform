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

### 👥 User Features
- **User Authentication**: Secure login and registration
- **User Profiles**: Manage user information
- **Collaboration**: Share and collaborate on blog posts

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
- **Express 5.1.0**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **AWS SDK v2**: AWS S3 integration
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management

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
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/academic-blog` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `AWS_ACCESS_KEY_ID` | AWS access key | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | From AWS IAM |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `academic-blog-images` |

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

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/:id` - Get blog by ID
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Images
- `POST /api/upload` - Upload image to S3

---

## 🤝 Contributing

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
│   │   └── aws.js                 # AWS S3 configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── blogController.js      # Blog CRUD operations
│   │   └── uploadController.js    # Image upload to S3
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── Blog.js                # Blog schema
│   ├── routes/
│   │   ├── auth.js                # Auth routes
│   │   ├── blogs.js               # Blog routes
│   │   └── upload.js              # Upload routes
│   ├── middleware/
│   │   └── auth.js                # JWT authentication
│   ├── .env                       # Environment variables
│   ├── .env.example               # Example env file
│   ├── server.js                  # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BlogEditor.jsx     # Main blog editor with Quill
│   │   │   ├── BlogList.jsx       # List of blogs
│   │   │   └── BlogView.jsx       # Blog view page
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Home page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   └── Dashboard.jsx      # User dashboard
│   │   ├── api/
│   │   │   └── api.js             # API client
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── .env                       # Environment variables
│   ├── vite.config.js             # Vite configuration
│   └── package.json
│
├── README.md                      # This file
└── .gitignore
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

