import React, { useState } from 'react';

const FileUploadStep = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');
    
    // Validate filetype
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    // Validate filesize (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Tax Form</h2>
        <p className="text-gray-600">
          Upload your tax form PDF to begin the extraction process
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8">
        <div
          className={`text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div className="mb-4">
            <p className="text-lg font-medium text-gray-900">
              {selectedFile ? selectedFile.name : 'Drop your PDF here'}
            </p>
            <p className="text-sm text-gray-500">
              {selectedFile 
                ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : 'or click to browse'
              }
            </p>
          </div>

          {!selectedFile && (
            <label className="cursor-pointer">
              <span className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Choose File
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileInput}
              />
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {selectedFile && (
          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Supported formats: PDF</p>
        <p>Maximum file size: 16MB</p>
      </div>
    </div>
  );
};

export default FileUploadStep; 
