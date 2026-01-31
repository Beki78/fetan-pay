"use client";
import React from "react";

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-11 h-6", 
    lg: "w-14 h-7"
  };

  const thumbSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const translateClasses = {
    sm: checked ? "translate-x-4" : "translate-x-0",
    md: checked ? "translate-x-5" : "translate-x-0", 
    lg: checked ? "translate-x-7" : "translate-x-0"
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        ${sizeClasses[size]}
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked 
          ? "bg-blue-600 dark:bg-blue-500" 
          : "bg-gray-200 dark:bg-gray-600"
        }
        ${disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "cursor-pointer"
        }
        ${className}
      `}
    >
      <span
        className={`
          ${thumbSizeClasses[size]}
          ${translateClasses[size]}
          inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
        `}
      />
    </button>
  );
};

export default Toggle;