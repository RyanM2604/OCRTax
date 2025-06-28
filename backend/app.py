import os
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ocr_extractor import OCRExtractor
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global config stuff
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Init OCRExtractor
ocr_extractor = OCRExtractor()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    # Health check to see if backend runs
    return jsonify({
        'status': 'healthy',
        'message': 'AutoParse API is running'
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    # Upload PDF
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check file selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check allowed filetype
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Generate filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}" #Using unique ID prefix
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        file.save(filepath)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': unique_filename,
            'filepath': filepath
        })
    
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/extract', methods=['POST'])
def extract_fields():
    # Extract fields from PDF w OCR
    try:
        data = request.get_json()
        
        if not data or 'filename' not in data:
            return jsonify({'error': 'Filename not provided'}), 400
        
        filename = data['filename']
        form_type = data.get('form_type', 'W-2')  # Default to W-2
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        # Extract fields using OCR and LLM
        extracted_data = ocr_extractor.extract_fields(filepath, form_type)
        
        return jsonify({
            'message': 'Fields extracted successfully',
            'data': extracted_data,
            'form_type': form_type
        })
    
    except Exception as e:
        return jsonify({'error': f'Extraction failed: {str(e)}'}), 500

@app.route('/tax-advice', methods=['POST'])
def get_tax_advice():
    # Get ChatGPT tax advice based on json
    try:
        data = request.get_json()
        
        if not data or 'extracted_data' not in data:
            return jsonify({'error': 'Extracted data not provided'}), 400
        
        extracted_data = data['extracted_data']
        form_type = data.get('form_type', 'W-2')
        
        # Get ChatGPT advice
        tax_advice = ocr_extractor.get_tax_advice(extracted_data, form_type)
        
        return jsonify({
            'message': 'Tax advice generated successfully',
            'advice': tax_advice,
            'form_type': form_type
        })
    
    except Exception as e:
        return jsonify({'error': f'Tax advice generation failed: {str(e)}'}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    # Download uploaded file
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    # Handle file too large error
    return jsonify({'error': 'File too large. Maximum size is 16MB'}), 413

@app.errorhandler(404)
def not_found(e):
    # Handle 404 errors
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    # Handle internal server errors
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Check if OpenAI API key is set. You have to create one and set it in the .env
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: OPENAI_API_KEY environment variable not set!")
        print("Please set it with: export OPENAI_API_KEY='your-api-key-here'")
    
    app.run(debug=True, host='0.0.0.0', port=5001) # Had to change port to 5001 cuz smth was running on 5000 for sum rsn
