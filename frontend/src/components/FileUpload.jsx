import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, formType, onFormTypeChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setError(null);
    
    // Validate filetype
    if (!file.type.includes('pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    
    // Validate filesize (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-6">
      {/* Form Type Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Form Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['W-2', '1099', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => onFormTypeChange(type)}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formType === type
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium">{type}</div>
              <div className="text-sm text-gray-500">
                {type === 'W-2' && 'Wage & Tax Statement'}
                {type === '1099' && 'Miscellaneous Income'}
                {type === 'Other' && 'Other Tax Forms'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Your {formType} Form
        </h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          {!selectedFile ? (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your PDF here, or{' '}
                <button
                  onClick={openFileDialog}
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-gray-500">
                Supports PDF files up to 16MB
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={openFileDialog}
                className="text-primary-600 hover:text-primary-700 underline text-sm"
              >
                Choose different file
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-error-600 mr-2" />
            <span className="text-error-700">{error}</span>
          </div>
        )}

        {selectedFile && !error && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="btn-primary w-full"
            >
              Extract Data from {selectedFile.name}
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">
          How it works:
        </h4>
        <ol className="text-blue-800 space-y-1 text-sm">
          <li>1. Upload your {formType} PDF form</li>
          <li>2. Our AI extracts key fields using OCR + GPT-4</li>
          <li>3. Review and edit the extracted data</li>
          <li>4. Download the structured JSON data</li>
        </ol>
      </div>
    </div>
  );
};

export default FileUpload; 
