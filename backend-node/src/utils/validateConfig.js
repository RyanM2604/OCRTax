/**
 * Configuration validation utility
 * Checks all required environment variables and provides helpful error messages
 */

const validateConfig = () => {
  const errors = [];
  const warnings = [];

  // Required environment variables
  const required = {
    MONGODB_URI: 'MongoDB connection string',
    JWT_SECRET: 'JWT secret for authentication',
    OPENAI_API_KEY: 'OpenAI API key for AI processing',
    AWS_ACCESS_KEY_ID: 'AWS Access Key ID',
    AWS_SECRET_ACCESS_KEY: 'AWS Secret Access Key',
    AWS_REGION: 'AWS Region',
    AWS_S3_BUCKET_NAME: 'AWS S3 Bucket name'
  };

  // Check required variables
  Object.entries(required).forEach(([key, description]) => {
    if (!process.env[key]) {
      errors.push(`Missing ${key}: ${description}`);
    }
  });

  // Optional but recommended
  const optional = {
    NODE_ENV: 'Environment (development/production)',
    PORT: 'Server port',
    RATE_LIMIT_WINDOW_MS: 'Rate limiting window',
    RATE_LIMIT_MAX_REQUESTS: 'Rate limiting max requests',
    MAX_FILE_SIZE: 'Maximum file upload size',
    ALLOWED_FILE_TYPES: 'Allowed file types for upload'
  };

  Object.entries(optional).forEach(([key, description]) => {
    if (!process.env[key]) {
      warnings.push(`Missing ${key}: ${description} (using default)`);
    }
  });

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Validate AWS region format
  if (process.env.AWS_REGION && !/^[a-z0-9-]+$/.test(process.env.AWS_REGION)) {
    warnings.push('AWS_REGION should be in format like us-east-1, eu-west-1, etc.');
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    warnings.push('MONGODB_URI should start with mongodb:// or mongodb+srv://');
  }

  return { errors, warnings };
};

const logValidationResults = () => {
  const { errors, warnings } = validateConfig();

  if (errors.length > 0) {
    console.error('\n❌ Configuration Errors:');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('\nPlease fix these errors before starting the server.\n');
    return false;
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
    console.warn('');
  }

  console.log('✅ Configuration validation passed\n');
  return true;
};

module.exports = { validateConfig, logValidationResults }; 