# AutoParse: AI-Powered Tax Form Extractor + Reviewer

🔍 **Summary**: A mini Magnetic clone that lets users upload W‑2 or 1099 PDFs, extracts structured data using OCR + LLM prompting, and shows a web UI for manual field review with confidence scores. Note this README was AI GENERATED.

## 🚀 Features

- **PDF Upload**: Drag & drop or file picker for tax form PDFs
- **OCR + LLM Extraction**: Tesseract OCR + GPT-4 for intelligent field extraction
- **Review Interface**: Web UI for manual field review with confidence scores
- **Export**: Download corrected data as JSON
- **Form Support**: W-2, 1099, and other tax forms

## 🛠️ Tech Stack

- **Backend**: Flask + Python
- **OCR**: Tesseract
- **LLM**: OpenAI GPT-4
- **Frontend**: React + Tailwind CSS
- **Storage**: Local file system

## 📁 Project Structure

```
ocrtax/
├── backend/
│   ├── app.py              # Flask API server
│   ├── ocr_extractor.py    # OCR + LLM processing
│   ├── requirements.txt    # Python dependencies
│   ├── env.example         # Environment variables template
│   └── uploads/            # Temporary PDF storage
├── frontend/
│   ├── package.json        # Node dependencies
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app
│   │   └── index.js        # Entry point
│   └── tailwind.config.js  # Tailwind config
└── README.md
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- Python 3.8+
- Node.js 16+
- Tesseract OCR
- OpenAI API key

### Automated Setup

1. **Run the setup script**:

   ```bash
   cd ocrtax
   ./setup.sh
   ```

2. **Add your OpenAI API key**:

   ```bash
   # Edit backend/.env and add your API key
   OPENAI_API_KEY=your-api-key-here
   ```

3. **Start the application**:

   ```bash
   # Terminal 1: Start backend
   cd backend
   source venv/bin/activate
   python app.py

   # Terminal 2: Start frontend
   cd frontend
   npm start
   ```

4. **Open** http://localhost:3000

### Manual Setup

#### Backend Setup

1. **Install Python dependencies**:

   ```bash
   cd ocrtax/backend
   pip install -r requirements.txt
   ```

2. **Install Tesseract**:

   - **macOS**: `brew install tesseract`
   - **Ubuntu**: `sudo apt-get install tesseract-ocr`
   - **Windows**: Download from GitHub releases

3. **Set up OpenAI API key**:

   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   # Or create backend/.env file with the key
   ```

4. **Run the Flask server**:
   ```bash
   python app.py
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

## 🔧 API Endpoints

- `POST /upload` - Upload PDF file
- `POST /extract` - Extract fields from uploaded PDF
- `GET /health` - Health check

## 📊 Output Format

```json
{
  "employer": { "value": "ACME Corp", "confidence": 0.87 },
  "ein": { "value": "12-3456789", "confidence": 0.93 },
  "wages": { "value": "$82,000", "confidence": 0.75 },
  "federal_tax_withheld": { "value": "$12,000", "confidence": 0.82 }
}
```

## 🎯 Usage

1. Upload a W-2 or 1099 PDF
2. Review extracted fields with confidence scores
3. Edit any incorrect values
4. Download the corrected JSON data

## 🔮 Future Enhancements

- Support for more tax form types
- Batch processing
- Integration with tax software APIs
- Machine learning model training on user corrections
- Cloud storage integration

## 📝 License

MIT License - feel free to use and modify!
# OCRTax
