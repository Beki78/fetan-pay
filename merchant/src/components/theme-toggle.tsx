"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { toggleTheme } from "@/lib/slices/themeSlice";
import { useEffect } from "react";

export function ThemeToggle() {
  const theme = useAppSelector((state) => state.theme.theme);
  const dispatch = useAppDispatch();
  // Initialize mounted state based on whether we're on the client
  const mounted = typeof window !== "undefined";

  useEffect(() => {
    if (!mounted) return;
    // Apply theme on mount
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon-lg"
        className=""
        aria-label="Toggle theme"
        disabled
      >
        <Moon />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon-lg"
      onClick={() => dispatch(toggleTheme())}
      className=""
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
