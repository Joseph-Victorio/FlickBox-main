import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiInfo } from 'react-icons/fi';

const ErrorMessage = ({ 
  message = "An error occurred", 
  onRetry, 
  className = "",
  retryLabel = "Try Again",
  severity = "error", // 'error', 'warning', or 'info'
  fullWidth = false
}) => {
  // Define styles based on severity
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      textColor: 'text-red-600',
      buttonColor: 'text-red-700 hover:text-red-900',
      focusRing: 'focus:ring-red-500'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-800',
      textColor: 'text-amber-600',
      buttonColor: 'text-amber-700 hover:text-amber-900',
      focusRing: 'focus:ring-amber-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-600',
      buttonColor: 'text-blue-700 hover:text-blue-900',
      focusRing: 'focus:ring-blue-500'
    }
  };

  const currentStyle = styles[severity] || styles.error;
  const Icon = severity === 'info' ? FiInfo : FiAlertTriangle;

  return (
    <div className={`${currentStyle.bg} ${currentStyle.border} rounded-lg p-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="flex items-start">
        <Icon 
          className={`${currentStyle.iconColor} text-xl flex-shrink-0 mt-0.5 mr-3`} 
        />
        
        <div className="flex-1">
          <h3 className={`${currentStyle.titleColor} font-medium mb-1`}>
            {severity === 'error' && 'Oops! Something went wrong'}
            {severity === 'warning' && 'Please Note'}
            {severity === 'info' && 'Information'}
          </h3>
          <p className={`${currentStyle.textColor} text-sm`}>{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 inline-flex items-center text-sm font-medium ${currentStyle.buttonColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentStyle.focusRing}`}
            >
              <FiRefreshCw className="mr-2" />
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;