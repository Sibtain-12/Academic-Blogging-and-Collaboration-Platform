const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // Try Cloudinary first if configured, otherwise use local storage
    if (isCloudinaryConfigured) {
      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'academic-blog',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        return res.status(200).json({
          success: true,
          url: result.secure_url,
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    // Local file storage fallback
    const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, req.file.buffer);

    // Return URL for local file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image',
    });
  }
};

