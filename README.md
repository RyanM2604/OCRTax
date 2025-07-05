# OCRTax: AI-Powered Tax Form Extractor + Reviewer

🔍 **Summary**: A modern web application that lets users upload W‑2, 1099, or 1040 PDFs, extracts structured data using OCR + AI, and provides intelligent tax advice. Built with Node.js, Docker, and AWS for scalability and reliability.

## 🚀 Features

- **PDF Upload**: Drag & drop or file picker for tax form PDFs
- **OCR + AI Extraction**: Tesseract OCR + GPT-4 for intelligent field extraction
- **Review Interface**: Web UI for manual field review with confidence scores
- **Tax Advice**: AI-powered tax advice based on extracted data
- **Export**: Download corrected data as JSON
- **Form Support**: W-2, 1099, 1040, and other tax forms
- **Cloud Storage**: Secure file storage with AWS S3
- **Authentication**: JWT-based user authentication
- **Rate Limiting**: Built-in protection against abuse

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (local or Atlas)
- **Cloud Storage**: AWS S3
- **AI/OCR**: OpenAI GPT-4 + Tesseract.js
- **Frontend**: React + Tailwind CSS
- **Containerization**: Docker + Docker Compose
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, Rate limiting

## 📁 Project Structure

```
ocrtax/
├── backend-node/           # Node.js backend
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, upload middleware
│   │   ├── services/       # AI/OCR services
│   │   ├── config/         # Database, AWS config
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Express server
│   ├── package.json        # Node dependencies
│   ├── Dockerfile          # Docker configuration
│   ├── docker-compose.yml  # Local development setup
│   ├── env.example         # Environment variables template
│   └── SETUP.md           # Detailed setup guide
├── frontend/               # React frontend
│   ├── package.json        # Node dependencies
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app
│   │   └── index.js        # Entry point
│   └── tailwind.config.js  # Tailwind config
├── setup.sh               # Automated setup script
└── README.md
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- AWS Account with S3 access
- OpenAI API key

### Automated Setup

1. **Run the setup script**:

   ```bash
   cd ocrtax
   ./setup.sh
   ```

2. **Configure environment variables**:

   ```bash
   # Copy and edit the environment template
   cp backend-node/env.example backend-node/.env
   # Add your API keys and AWS credentials
   ```

3. **Start the application**:

   ```bash
   # Option 1: Using Docker Compose (recommended)
   docker-compose up -d

   # Option 2: Manual start
   # Terminal 1: Start backend
   cd backend-node
   npm install
   npm run dev

   # Terminal 2: Start frontend
   cd frontend
   npm install
   npm start
   ```

4. **Open** http://localhost:3000

### Manual Setup

#### Backend Setup

1. **Install Node.js dependencies**:

   ```bash
   cd ocrtax/backend-node
   npm install
   ```

2. **Set up MongoDB**:

   ```bash
   # Local MongoDB
   brew services start mongodb/brew/mongodb-community

   # Or use MongoDB Atlas (cloud)
   # Create account at mongodb.com/atlas
   ```

3. **Configure environment variables**:

   ```bash
   cp env.example .env
   # Edit .env with your API keys and AWS credentials
   ```

4. **Run the Express server**:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Install Node dependencies**:

   ```bash
   cd ocrtax/frontend
   npm install
   ```

2. **Start the React dev server**:

   ```bash
   npm start
   ```

3. **Open** http://localhost:3000

### Docker Setup (Recommended)

1. **Start with Docker Compose**:

   ```bash
   cd ocrtax
   docker-compose up -d
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017

## 🔧 API Endpoints

### Document Management

- `POST /api/documents/upload` - Upload PDF file
- `GET /api/documents` - Get user's documents
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document data
- `DELETE /api/documents/:id` - Delete document

### AI Processing

- `POST /api/documents/resume-feedback` - Generate tax advice
- `POST /api/documents/:id/reprocess` - Reprocess document

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Health Check

- `GET /health` - Server health check

## 📊 Output Format

### Extracted Data

```json
{
  "employer": { "value": "ACME Corp", "confidence": 0.87 },
  "ein": { "value": "12-3456789", "confidence": 0.93 },
  "wages": { "value": "$82,000", "confidence": 0.75 },
  "federal_tax_withheld": { "value": "$12,000", "confidence": 0.82 }
}
```

### Tax Advice Response

```json
{
  "summary": "Brief overview of tax situation",
  "key_insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "potential_deductions": ["Deduction 1", "Deduction 2"],
  "next_steps": ["Step 1", "Step 2"],
  "estimated_tax_impact": "Estimated impact on tax liability",
  "disclaimer": "Legal disclaimer"
}
```

## 🎯 Usage

1. **Upload**: Upload a W-2, 1099, or 1040 PDF
2. **Review**: Review extracted fields with confidence scores
3. **Edit**: Edit any incorrect values in the web interface
4. **Advice**: Get AI-powered tax advice based on your data
5. **Export**: Download the corrected JSON data
6. **Store**: Files are securely stored in AWS S3

## 🔮 Future Enhancements

- **Enhanced AI Models**: Fine-tuned models for specific tax forms
- **Batch Processing**: Process multiple documents simultaneously
- **Tax Software Integration**: Direct integration with TurboTax, H&R Block APIs
- **Machine Learning**: Train models on user corrections for improved accuracy
- **Advanced Analytics**: Tax optimization suggestions and year-over-year comparisons
- **Multi-language Support**: Support for international tax forms
- **Mobile App**: Native iOS/Android applications
- **Enterprise Features**: Multi-user management, audit trails, compliance tools

## 📝 License

MIT License - feel free to use and modify!

## 📚 Documentation

- [Backend Setup Guide](backend-node/SETUP.md) - Detailed backend configuration
- [Deployment Guide](backend-node/DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](backend-node/README.md) - Complete API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For issues and questions:

- Check the [setup guide](backend-node/SETUP.md) for common problems
- Review the [troubleshooting section](backend-node/SETUP.md#troubleshooting)
- Open an issue on GitHub
