"use client";
import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

export default function DatePicker({
  selected,
  onChange,
  placeholderText = "Select date",
  maxDate,
  minDate,
  className = "",
}: DatePickerProps) {
  return (
    <div className="relative">
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        dateFormat="MMM dd, yyyy"
        maxDate={maxDate}
        minDate={minDate}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          ${className}`}
        calendarClassName="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700"
        wrapperClassName="w-full"
        showPopperArrow={false}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}
