const AWS = require('aws-sdk');

// Validate required environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing AWS environment variables: ${missingVars.join(', ')}`);
  console.warn('AWS functionality will not work without these variables.');
}

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Initialize S3
const s3 = new AWS.S3();

// Initialize other AWS services as needed
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = {
  s3,
  dynamoDB,
  uploadToS3: async (file, key) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  },

  deleteFromS3: async (key) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  },

  getSignedUrl: async (key, expiresIn = 3600) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    };

    try {
      return await s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  },
}; 