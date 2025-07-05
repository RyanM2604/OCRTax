import React, { useState, useEffect } from 'react';

const ReviewStep = ({ uploadedFile, formType, onDataExtracted, onBack }) => {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    if (uploadedFile) {
      extractData();
    }
  }, [uploadedFile]);

  const extractData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Upload file and extract data in one call using the new API
      const formData = new FormData();
      formData.append('document', uploadedFile);
      formData.append('documentType', formType);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload and extraction failed');
      }

      const result = await response.json();
      
      // Check if the document was processed successfully
      if (result.data && result.data.document) {
        // For now, create a simple data structure from the document
        // In a real app, you'd poll for the processing status
        const extractedData = {
          document_id: result.data.document.id,
          status: result.data.document.status,
          // Add some sample data for demonstration
          employer: { value: 'Sample Company', confidence: 0.9 },
          wages: { value: '$50,000', confidence: 0.8 },
          federal_tax_withheld: { value: '$5,000', confidence: 0.7 }
        };
        
        setExtractedData(extractedData);
        setEditedData(extractedData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (fieldName, newValue) => {
    setEditedData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value: newValue
      }
    }));
  };

  const handleContinue = () => {
    onDataExtracted(editedData);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(editedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted_data_${formType.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Your Document
          </h3>
          <p className="text-gray-600">
            We're extracting data from your {formType} form using AI...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!extractedData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Extracted Data</h2>
        <p className="text-gray-600">
          Review and edit the extracted information from your {formType} form
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Extracted Fields
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(editedData).map(([fieldName, fieldData]) => (
                <tr key={fieldName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={fieldData.value || ''}
                      onChange={(e) => handleFieldEdit(fieldName, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter value..."
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(fieldData.confidence)}`}>
                      {getConfidenceText(fieldData.confidence)} ({(fieldData.confidence * 100).toFixed(0)}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Get Tax Advice
        </button>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Ready for Tax Advice</h3>
            <p className="text-sm text-blue-700 mt-1">
              Click "Get Tax Advice" to receive personalized tax recommendations based on your extracted data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep; 
