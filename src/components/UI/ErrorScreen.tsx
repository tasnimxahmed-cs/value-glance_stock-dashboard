import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  title?: string;
  retryLabel?: string;
  showRetry?: boolean;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  error,
  onRetry,
  title = "Error Loading Data",
  retryLabel = "Try Again",
  showRetry = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
        
        {showRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{retryLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;