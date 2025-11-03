const AWS = require('aws-sdk');

// Check if AWS S3 credentials are configured
const isAWSConfigured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_S3_BUCKET_NAME &&
  process.env.AWS_ACCESS_KEY_ID !== 'your_access_key_id' &&
  process.env.AWS_SECRET_ACCESS_KEY !== 'your_secret_access_key' &&
  process.env.AWS_REGION !== 'your_region' &&
  process.env.AWS_S3_BUCKET_NAME !== 'your_bucket_name';

if (isAWSConfigured) {
  // Configure AWS SDK
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  console.log('✅ AWS S3 configured successfully');
} else {
  console.error('❌ AWS S3 not configured - image upload will fail');
  console.error('   Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME in .env');
}

// Create S3 service object
const s3 = new AWS.S3();

// Configure CORS for the S3 bucket
const configureCORS = async () => {
  if (!isAWSConfigured) {
    console.log('⚠️ AWS S3 not configured - skipping CORS configuration');
    return;
  }

  try {
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag', 'x-amz-version-id'],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    await s3.putBucketCors({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    }).promise();

    console.log('✅ S3 CORS configured successfully');
  } catch (error) {
    console.error('⚠️ Could not configure S3 CORS:', error.message);
    console.error('   Please configure CORS manually in AWS S3 console');
  }
};

// Configure CORS on startup
if (isAWSConfigured) {
  configureCORS();
}

module.exports = { s3, isAWSConfigured, configureCORS };

