# OCRTax Backend Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- AWS Account with S3 access
- OpenAI API key

## Quick Start

1. **Clone and install dependencies:**

   ```bash
   cd backend-node
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start MongoDB:**

   ```bash
   # Local MongoDB
   brew services start mongodb/brew/mongodb-community

   # Or use Docker
   docker-compose up -d
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

| Variable                | Description               | Example                                  |
| ----------------------- | ------------------------- | ---------------------------------------- |
| `MONGODB_URI`           | MongoDB connection string | `mongodb://localhost:27017/ocrtax`       |
| `JWT_SECRET`            | Secret for JWT tokens     | `your-super-secret-jwt-key-32-chars-min` |
| `OPENAI_API_KEY`        | OpenAI API key            | `sk-...`                                 |
| `AWS_ACCESS_KEY_ID`     | AWS Access Key ID         | `AKIA...`                                |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key     | `...`                                    |
| `AWS_REGION`            | AWS Region                | `us-east-1`                              |
| `AWS_S3_BUCKET_NAME`    | S3 Bucket name            | `ocrtax-documents`                       |

### Optional Variables

| Variable                  | Description             | Default           |
| ------------------------- | ----------------------- | ----------------- |
| `PORT`                    | Server port             | `5001`            |
| `NODE_ENV`                | Environment             | `development`     |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window       | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100`             |
| `MAX_FILE_SIZE`           | Max file upload size    | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES`      | Allowed file types      | `pdf,PDF`         |

## AWS Setup

1. **Create S3 Bucket:**

   - Go to AWS S3 Console
   - Create a new bucket (e.g., `ocrtax-documents`)
   - Keep default settings for now

2. **Create IAM User:**

   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach the `OCRTaxS3Access` policy (see below)

3. **S3 Access Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR-BUCKET-NAME",
           "arn:aws:s3:::YOUR-BUCKET-NAME/*"
         ]
       }
     ]
   }
   ```

## MongoDB Setup

### Local MongoDB

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

### MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get API key
3. Add to `.env` as `OPENAI_API_KEY`

## Testing

```bash
# Test API endpoints
npm run test:api

# Run health check
curl http://localhost:5001/health
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed:**

   - Ensure MongoDB is running
   - Check `MONGODB_URI` format
   - For Atlas, ensure IP is whitelisted

2. **AWS S3 Upload Failed:**

   - Verify AWS credentials
   - Check bucket name and permissions
   - Ensure bucket exists

3. **OpenAI API Errors:**

   - Verify API key is correct
   - Check account has credits
   - Ensure API key has proper permissions

4. **JWT Errors:**
   - Ensure `JWT_SECRET` is set
   - Secret should be at least 32 characters

### Logs

The server provides detailed logging:

- Configuration validation on startup
- Database connection status
- API request logs
- Error details

## Production Deployment

See `DEPLOYMENT.md` for production deployment instructions.
