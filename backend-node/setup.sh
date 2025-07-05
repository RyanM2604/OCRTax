#!/bin/bash

# OCRTax Backend Setup Script
# This script sets up the Node.js backend with all necessary dependencies

set -e

echo "🚀 Setting up OCRTax Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Create environment file
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_success ".env file created"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists"
    fi
}

# Create uploads directory
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p uploads
    print_success "Directories created"
}

# Check MongoDB connection
check_mongodb() {
    print_status "Checking MongoDB connection..."
    if command -v mongosh &> /dev/null; then
        print_success "MongoDB client found"
    else
        print_warning "MongoDB client not found. Please install MongoDB or use MongoDB Atlas"
        print_status "For local MongoDB: https://docs.mongodb.com/manual/installation/"
        print_status "For MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
    fi
}

# Display setup instructions
display_instructions() {
    echo ""
    echo "🎉 Setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your configuration:"
    echo "   - AWS credentials and S3 bucket"
    echo "   - OpenAI API key"
    echo "   - MongoDB connection string"
    echo "   - JWT secret"
    echo ""
    echo "2. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "3. The API will be available at:"
    echo "   http://localhost:5000"
    echo ""
    echo "4. Health check endpoint:"
    echo "   http://localhost:5000/health"
    echo ""
    echo "📚 For more information, see README.md"
}

# Main setup function
main() {
    print_status "Starting OCRTax Backend setup..."
    
    check_node
    check_npm
    install_dependencies
    setup_env
    create_directories
    check_mongodb
    display_instructions
}

# Run main function
main "$@" 