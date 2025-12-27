"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useEffect } from "react";
import { setTheme } from "@/lib/slices/themeSlice";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        store.dispatch(setTheme(stored));
      } else {
        // Check system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        store.dispatch(setTheme(prefersDark ? "dark" : "light"));
      }
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="top-center" />
    </Provider>
  );
}

