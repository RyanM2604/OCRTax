import React, { useState } from 'react';
import FileUploadStep from './components/FileUploadStep';
import FormTypeStep from './components/FormTypeStep';
import ReviewStep from './components/ReviewStep';
import TaxAdviceStep from './components/TaxAdviceStep';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formType, setFormType] = useState('W-2');
  const [extractedData, setExtractedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, name: 'Upload File', description: 'Upload your tax form PDF' },
    { id: 2, name: 'Select Form Type', description: 'Choose the type of form' },
    { id: 3, name: 'Review Data', description: 'Review and edit extracted data' },
    { id: 4, name: 'Tax Advice', description: 'Get AI-powered tax advice' }
  ];

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    nextStep();
  };

  const handleFormTypeSelect = (type) => {
    setFormType(type);
    nextStep();
  };

  const handleDataExtracted = (data) => {
    setExtractedData(data);
    nextStep();
  };

  const handleComplete = () => {
    // Reset
    setCurrentStep(1);
    setUploadedFile(null);
    setFormType('W-2');
    setExtractedData(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FileUploadStep onFileUpload={handleFileUpload} />;
      case 2:
        return <FormTypeStep onFormTypeSelect={handleFormTypeSelect} />;
      case 3:
        return (
          <ReviewStep
            uploadedFile={uploadedFile}
            formType={formType}
            onDataExtracted={handleDataExtracted}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <TaxAdviceStep
            extractedData={extractedData}
            formType={formType}
            onBack={prevStep}
            onComplete={handleComplete}
          />
        );
      default:
        return <FileUploadStep onFileUpload={handleFileUpload} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AutoParse</h1>
              <p className="text-gray-600">AI-Powered Tax Form Extractor & Advisor</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            AutoParse - AI-Powered Tax Form Processing
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 
