import React, { useState } from 'react';

const TaxAdviceStep = ({ extractedData, formType, onBack, onComplete }) => {
  const [taxAdvice, setTaxAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTaxAdvice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/documents/resume-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: extractedData,
          customPrompt: `Provide tax advice for ${formType} form data`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTaxAdvice(data.data.feedback);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const AdviceSection = ({ title, items, className = "" }) => (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      {Array.isArray(items) ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">{items}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tax Advice</h2>
        <p className="text-gray-600">
          Get personalized tax advice based on your extracted form data
        </p>
      </div>

      {!taxAdvice && !loading && (
        <div className="text-center py-12">
          <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-blue-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready for Tax Advice?
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to get AI-powered tax advice based on your {formType} form data.
            </p>
            <button
              onClick={getTaxAdvice}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Generate Tax Advice
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized tax advice...</p>
        </div>
      )}

      {error && (
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
      )}

      {taxAdvice && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{taxAdvice.summary}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <AdviceSection 
              title="Key Insights" 
              items={taxAdvice.key_insights}
              className="border-l-4 border-blue-500"
            />

            {/* Recommendations */}
            <AdviceSection 
              title="Recommendations" 
              items={taxAdvice.recommendations}
              className="border-l-4 border-green-500"
            />
          </div>

          {/* Form-specific sections */}
          {formType === 'W-2' && taxAdvice.potential_deductions && (
            <AdviceSection 
              title="Potential Deductions" 
              items={taxAdvice.potential_deductions}
              className="border-l-4 border-purple-500"
            />
          )}

          {formType === '1099' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {taxAdvice.business_expenses && (
                <AdviceSection 
                  title="Business Expenses" 
                  items={taxAdvice.business_expenses}
                  className="border-l-4 border-orange-500"
                />
              )}
              {taxAdvice.quarterly_estimates && (
                <AdviceSection 
                  title="Quarterly Estimates" 
                  items={taxAdvice.quarterly_estimates}
                  className="border-l-4 border-yellow-500"
                />
              )}
            </div>
          )}

          {/* Next Steps */}
          <AdviceSection 
            title="Next Steps" 
            items={taxAdvice.next_steps}
            className="border-l-4 border-indigo-500"
          />

          {/* Tax Impact */}
          {taxAdvice.estimated_tax_impact && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Estimated Tax Impact</h3>
              <p className="text-yellow-700">{taxAdvice.estimated_tax_impact}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">{taxAdvice.disclaimer}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Review
            </button>
            <button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Complete Process
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxAdviceStep; 