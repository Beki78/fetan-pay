"use client";
import { useState, useCallback } from "react";
import Toast, { ToastType } from "./Toast";

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
    duration: number;
  }>({
    message: "",
    type: "success",
    isVisible: false,
    duration: 3000,
  });

  const showToast = useCallback((messageOrOptions: string | ToastOptions, type: ToastType = "success") => {
    if (typeof messageOrOptions === 'string') {
      // Old interface: showToast(message, type)
      setToast({
        message: messageOrOptions,
        type,
        isVisible: true,
        duration: 3000,
      });
    } else {
      // New interface: showToast({ type, message, duration })
      setToast({
        message: messageOrOptions.message,
        type: messageOrOptions.type,
        isVisible: true,
        duration: messageOrOptions.duration || 3000,
      });
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      duration={toast.duration}
      onClose={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
}

