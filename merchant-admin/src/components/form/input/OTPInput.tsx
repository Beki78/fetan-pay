"use client";
import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OTPInput({ 
  length = 4, 
  value, 
  onChange, 
  disabled = false,
  error = false 
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));

  // Update internal state when value prop changes
  useEffect(() => {
    const newOtp = value.split("").slice(0, length);
    while (newOtp.length < length) {
      newOtp.push("");
    }
    setOtp(newOtp);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is empty, go to previous box
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Only process if it's all digits and matches length
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, length).split("");
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (i < length) {
          newOtp[i] = digit;
        }
      });
      
      setOtp(newOtp);
      onChange(newOtp.join(""));
      
      // Focus last filled input or last input
      const lastIndex = Math.min(digits.length, length) - 1;
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-semibold
            border-2 rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error 
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500 text-error-600' 
              : 'border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500 text-gray-900 dark:text-white'
            }
            ${disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' 
              : 'bg-white dark:bg-gray-900'
            }
            hover:border-gray-400 dark:hover:border-gray-600
          `}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
