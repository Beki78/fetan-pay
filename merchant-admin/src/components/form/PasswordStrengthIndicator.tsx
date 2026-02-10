"use client";
import React from 'react';
import { getPasswordStrength } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  isVisible?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  isVisible,
  className = "" 
}) => {
  const { requirements } = getPasswordStrength(password);

  // Don't render if not visible or no password
  if (!isVisible || !password) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
              req.met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {req.met && (
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`${
              req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;