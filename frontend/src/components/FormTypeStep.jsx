import React, { useState } from 'react';

const FormTypeStep = ({ onFormTypeSelect }) => {
  const [selectedType, setSelectedType] = useState('W-2');

  const formTypes = [
    {
      id: 'W-2',
      name: 'W-2 Form',
      description: 'Wage and Tax Statement',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      fields: ['Employer Info', 'Employee Info', 'Wages', 'Tax Withholding', 'Social Security', 'Medicare']
    },
    {
      id: '1099',
      name: '1099 Form',
      description: 'Miscellaneous Income',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      fields: ['Payer Info', 'Recipient Info', 'Nonemployee Compensation', 'Tax Withholding']
    },
    {
      id: 'Other',
      name: 'Other Forms',
      description: 'Other tax documents',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      fields: ['General Information', 'Financial Data', 'Tax Information']
    }
  ];

  const handleContinue = () => {
    onFormTypeSelect(selectedType);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Form Type</h2>
        <p className="text-gray-600">
          Choose the type of tax form you're processing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {formTypes.map((formType) => (
          <div
            key={formType.id}
            className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
              selectedType === formType.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedType(formType.id)}
          >
            {selectedType === formType.id && (
              <div className="absolute top-4 right-4">
                <div className="bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                selectedType === formType.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {formType.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {formType.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {formType.description}
              </p>
              
              <div className="text-left">
                <p className="text-xs font-medium text-gray-700 mb-2">Extracts:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {formType.fields.map((field, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-blue-500 mr-1">•</span>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Continue with {formTypes.find(f => f.id === selectedType)?.name}
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This helps us provide more accurate extraction and better tax advice</p>
      </div>
    </div>
  );
};

export default FormTypeStep; 