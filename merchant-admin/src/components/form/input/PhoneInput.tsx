"use client";
import React, { FC, useState, useEffect } from "react";

interface PhoneInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  success?: boolean;
  hint?: string;
  required?: boolean;
}

const PhoneInput: FC<PhoneInputProps> = ({
  id,
  name,
  placeholder = "9XXXXXXXX",
  value = "",
  onChange,
  onBlur,
  className = "",
  disabled = false,
  readOnly = false,
  error = false,
  success = false,
  hint,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  // Initialize input value from prop
  useEffect(() => {
    if (value) {
      // Remove +251 prefix for display if present
      const displayValue = value.replace(/^\+251/, "");
      setInputValue(displayValue);
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Remove any non-digit characters
    newValue = newValue.replace(/\D/g, "");
    
    // Limit to 9 digits (Ethiopian mobile numbers without country code)
    if (newValue.length > 9) {
      newValue = newValue.slice(0, 9);
    }
    
    // Ensure it starts with 7 or 9 (Ethiopian mobile prefixes)
    if (newValue.length > 0 && !['7', '9'].includes(newValue[0])) {
      return; // Don't update if first digit is not 7 or 9
    }
    
    setInputValue(newValue);
    
    // Send the full international format to parent
    const fullNumber = newValue ? `+251${newValue}` : "";
    onChange?.(fullNumber);
  };

  // Determine input styles based on state
  let inputClasses = `h-11 w-full rounded-lg border appearance-none pl-16 pr-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (readOnly) {
    inputClasses += ` bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 cursor-default`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <div className="relative">
        {/* Country Code Prefix */}
        <div className="absolute left-0 top-0 h-full flex items-center px-3 border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-l-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            +251
          </span>
        </div>
        
        <input
          type="tel"
          id={id}
          name={name}
          placeholder={placeholder}
          value={inputValue}
          onChange={readOnly ? undefined : handleInputChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClasses}
          maxLength={9}
        />
      </div>

      {/* Hint Text */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;