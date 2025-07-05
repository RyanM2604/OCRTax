# OCRTax Backend - Node.js/Express with AWS Integration

A robust Node.js/Express backend for AI-powered tax form extraction with AWS cloud storage and OpenAI integration.

## 🚀 Features

- **Secure Authentication**: JWT-based user authentication with bcrypt password hashing
- **PDF Processing**: OCR + AI-powered tax form extraction using Tesseract.js and OpenAI
- **AWS Integration**: S3 for file storage, DynamoDB for additional data (if needed)
- **Custom Prompts**: User-customizable AI prompts for different document types
- **Resume Feedback**: AI-powered resume analysis and feedback generation
- **Rate Limiting**: Built-in rate limiting and speed limiting for API protection
- **Cloud Storage**: All documents stored securely in AWS S3
- **Real-time Processing**: Asynchronous document processing with status tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer with S3 integration
- **AI/OCR**: OpenAI GPT-4 + Tesseract.js
- **Cloud**: AWS S3, AWS SDK
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express-validator

## 📁 Project Structure

```
backend-node/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── aws.js          # AWS configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── documentController.js # Document processing
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── upload.js       # File upload handling
│   ├── models/
│   │   ├── User.js         # User model
│   │   └── TaxDocument.js  # Document model
│   ├── routes/
│   │   ├── auth.js         # Auth routes
│   │   └── documents.js    # Document routes
│   ├── services/
│   │   └── aiService.js    # AI/OCR processing
│   └── server.js           # Main server file
├── package.json
├── env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- AWS Account with S3 bucket
- OpenAI API key

### Installation

1. **Clone and navigate to backend**:

   ```bash
   cd ocrtax/backend-node
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ocrtax
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ocrtax

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,PDF
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Document Endpoints

#### Upload Document

```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

document: <file>
documentType: "W-2"
customPrompt: "Extract all employer information"
```

#### Get Documents

```http
GET /api/documents?page=1&limit=10&status=completed
Authorization: Bearer <token>
```

#### Get Single Document

```http
GET /api/documents/:id
Authorization: Bearer <token>
```

#### Update Document

```http
PUT /api/documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "extractedData": {
    "employer": {
      "value": "Updated Company Name",
      "confidence": 0.95
    }
  }
}
```

#### Reprocess Document

```http
POST /api/documents/:id/reprocess
Authorization: Bearer <token>
Content-Type: application/json

{
  "customPrompt": "Focus on financial amounts only"
}
```

#### Delete Document

```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

### Resume Feedback

#### Generate Resume Feedback

```http
POST /api/documents/resume-feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "resumeData": {
    "experience": "...",
    "education": "...",
    "skills": "..."
  },
  "customPrompt": "Focus on technical skills"
}
```

## 🔧 AWS Setup

### S3 Bucket Configuration

1. **Create S3 Bucket**:

   - Go to AWS S3 Console
   - Create a new bucket with unique name
   - Enable versioning (optional)
   - Configure CORS if needed

2. **IAM User Setup**:

   - Create IAM user with programmatic access
   - Attach S3FullAccess policy (or create custom policy)
   - Save Access Key ID and Secret Access Key

3. **Bucket Policy** (Optional):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PrivateAccess",
         "Effect": "Deny",
         "Principal": "*",
         "Action": "s3:*",
         "Resource": "arn:aws:s3:::your-bucket-name/*",
         "Condition": {
           "StringNotEquals": {
             "aws:PrincipalArn": "arn:aws:iam::your-account-id:user/your-iam-user"
           }
         }
       }
     ]
   }
   ```

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production Deployment

1. **Environment Setup**:

   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production MongoDB URI
   - Set up proper CORS origins

2. **Process Manager** (PM2):

   ```bash
   npm install -g pm2
   pm2 start src/server.js --name ocrtax-backend
   pm2 startup
   pm2 save
   ```

3. **Docker Deployment**:

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

4. **AWS EC2/ECS**:
   - Deploy to EC2 with PM2
   - Or use ECS with Docker
   - Set up load balancer
   - Configure auto-scaling

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Express-validator for all inputs
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers
- **File Upload Validation**: Type and size restrictions
- **AWS IAM**: Least privilege access

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Global error handler with proper responses
- **Health Check**: `/health` endpoint for monitoring
- **Graceful Shutdown**: Proper process termination

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

- Create GitHub issue
- Check documentation
- Review error logs

## 🔄 Migration from Python Backend

This Node.js backend replaces the Python Flask backend with:

- **Better Performance**: Node.js async/await
- **Enhanced Security**: JWT + bcrypt
- **Cloud Integration**: AWS S3 + MongoDB
- **Scalability**: Rate limiting + compression
- **Modern Architecture**: MVC pattern with services
