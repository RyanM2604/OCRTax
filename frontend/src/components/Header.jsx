import React from 'react';
import { FileText, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AutoParse</h1>
              <p className="text-sm text-gray-600">AI-Powered Tax Form Extractor</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 