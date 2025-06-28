#!/bin/bash

echo "🚀 Setting up AutoParse - AI-Powered Tax Form Extractor (Local Development)"
echo "=========================================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if Tesseract is installed
if ! command -v tesseract &> /dev/null; then
    echo "⚠️  Tesseract is not installed. Installing..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install tesseract
        else
            echo "❌ Homebrew is not installed. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y tesseract-ocr
    else
        echo "❌ Please install Tesseract manually for your operating system."
        echo "   Visit: https://github.com/tesseract-ocr/tesseract"
        exit 1
    fi
fi

echo "✅ Tesseract is installed"

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env and add your OpenAI API key"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

# Install Node.js dependencies
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Add your OpenAI API key to backend/.env"
echo "2. Start the backend: cd backend && source venv/bin/activate && python app.py"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md" 