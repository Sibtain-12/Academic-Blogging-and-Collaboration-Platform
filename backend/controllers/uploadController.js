const { s3, isAWSConfigured } = require('../config/aws');

// @desc    Upload image to AWS S3
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

    // Check if AWS S3 is configured
    if (!isAWSConfigured) {
      return res.status(500).json({
        success: false,
        message: 'AWS S3 is not configured. Please contact the administrator.',
      });
    }

    // Generate unique file name
    const fileName = `academic-blog/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;

    // Prepare S3 upload parameters
    // Note: ACL is not set here because the bucket has ACLs disabled
    // Access is controlled by the bucket policy instead (modern approach)
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // Upload to S3
    s3.upload(params, (err, data) => {
      if (err) {
        console.error('AWS S3 upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error uploading image to AWS S3',
          error: err.message,
        });
      }

      // Return the S3 URL
      res.status(200).json({
        success: true,
        url: data.Location,
      });
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image',
    });
  }
};

