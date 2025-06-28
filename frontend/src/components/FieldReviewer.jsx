import React, { useState } from 'react';
import { Edit3, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';

const FieldReviewer = ({ data, onDataUpdate, formType }) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  };

  const getFieldLabel = (key) => {
    const labels = {
      // W-2 fields
      employer: 'Employer Name',
      ein: 'Employer EIN',
      employee_ssn: 'Employee SSN',
      wages: 'Wages, Tips, Other Compensation',
      federal_tax_withheld: 'Federal Income Tax Withheld',
      social_security_wages: 'Social Security Wages',
      social_security_tax_withheld: 'Social Security Tax Withheld',
      medicare_wages: 'Medicare Wages and Tips',
      medicare_tax_withheld: 'Medicare Tax Withheld',
      state: 'State',
      state_wages: 'State Wages, Tips, etc.',
      state_tax_withheld: 'State Income Tax Withheld',
      
      // 1099 fields
      payer_name: 'Payer Name',
      payer_tin: 'Payer TIN',
      recipient_name: 'Recipient Name',
      recipient_tin: 'Recipient TIN',
      nonemployee_compensation: 'Nonemployee Compensation',
      state_income: 'State Income',
      
      // Generic fields
      form_type: 'Form Type',
      identification_number: 'Identification Number',
      total_amount: 'Total Amount',
      tax_withheld: 'Tax Withheld',
    };
    
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const startEditing = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editingField) {
      const updatedData = { ...data };
      updatedData[editingField] = {
        ...updatedData[editingField],
        value: editValue,
        confidence: 1.0 // User entry, so confidence == 100%
      };
      onDataUpdate(updatedData);
      setEditingField(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const formatValue = (value) => {
    if (!value || value === 'Not found') {
      return <span className="text-gray-400 italic">Not found</span>;
    }
    return value;
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Extracted Fields
        </h3>
        <p className="text-sm text-gray-600">
          Review and edit the extracted data. Fields with low confidence scores are highlighted.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Value</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Confidence</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, fieldData]) => {
              const { value, confidence } = fieldData;
              const isEditing = editingField === key;
              
              return (
                <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {getFieldLabel(key)}
                  </td>
                  
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="input-field"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-700">{formatValue(value)}</span>
                    )}
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getConfidenceClass(confidence)}`}>
                      {getConfidenceIcon(confidence)}
                      <span>{(confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={saveEdit}
                          className="p-1 text-success-600 hover:text-success-700"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(key, value)}
                        className="p-1 text-primary-600 hover:text-primary-700"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Object.keys(data).length}
          </div>
          <div className="text-sm text-gray-600">Total Fields</div>
        </div>
        
        <div className="bg-success-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-success-600">
            {Object.values(data).filter(field => field.confidence >= 0.8).length}
          </div>
          <div className="text-sm text-success-600">High Confidence</div>
        </div>
        
        <div className="bg-warning-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-warning-600">
            {Object.values(data).filter(field => field.confidence < 0.8).length}
          </div>
          <div className="text-sm text-warning-600">Needs Review</div>
        </div>
      </div>
    </div>
  );
};

export default FieldReviewer; 
