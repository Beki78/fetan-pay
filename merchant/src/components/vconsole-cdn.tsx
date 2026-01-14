"use client";

import { useEffect } from "react";

interface WindowWithVConsole extends Window {
  VConsole?: new (options?: {
    theme?: string;
    defaultPlugins?: string[];
  }) => unknown;
  vConsole?: unknown;
}

export default function VConsoleCDN() {
  useEffect(() => {
    const win = window as WindowWithVConsole;

    // Check if vConsole is already loaded and initialized
    if (win.vConsole) {
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="vconsole"]')) {
      return;
    }

    try {
      const script = document.createElement("script");
      // Use jsdelivr CDN with a stable version (3.14.0 is known to be stable)
      script.src =
        "https://cdn.jsdelivr.net/npm/vconsole@3.14.0/dist/vconsole.min.js";
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        try {
          // Wait a bit for the script to fully initialize
          setTimeout(() => {
            try {
              const VConsole = win.VConsole;
              if (VConsole) {
                // Try simple initialization first (no options)
                try {
                  const vc = new VConsole();
                  win.vConsole = vc;
                  console.log("✅ vConsole initialized successfully");
                } catch (simpleError) {
                  // If simple init fails, try with minimal options
                  try {
                    const vc = new VConsole({});
                    win.vConsole = vc;
                    console.log("✅ vConsole initialized with minimal options");
                  } catch (minimalError) {
                    console.error(
                      "❌ Error initializing vConsole (simple):",
                      simpleError
                    );
                    console.error(
                      "❌ Error initializing vConsole (minimal):",
                      minimalError
                    );
                  }
                }
              } else {
                console.error("❌ VConsole class not found on window");
              }
            } catch (error) {
              console.error("❌ Error initializing vConsole:", error);
            }
          }, 200);
        } catch (error) {
          console.error("❌ Error in vConsole onload handler:", error);
        }
      };

      script.onerror = () => {
        console.error("❌ Failed to load vConsole script from CDN");
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("❌ Error creating vConsole script:", error);
    }
  }, []);

  return null;
}
