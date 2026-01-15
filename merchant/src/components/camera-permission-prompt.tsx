"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCameraPermission } from "@/hooks/useCameraPermission";

export function CameraPermissionPrompt() {
  const { permission, requestPermission } = useCameraPermission();
  const [isRequesting, setIsRequesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if already dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("camera-permission-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Don't show if already granted, denied, or dismissed
  if (permission === "granted" || permission === "denied" || dismissed || permission === "unknown") {
    return null;
  }

  const handleRequest = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("camera-permission-dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Camera Access Required
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRequesting 
                ? "Please tap 'Allow' on the browser popup above ☝️"
                : "This app needs camera access to scan QR codes for payments and login."
              }
            </p>
          </div>

          <div className="w-full space-y-2 pt-2">
            <Button
              onClick={handleRequest}
              disabled={isRequesting}
              className="w-full h-12 text-base"
            >
              {isRequesting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Waiting for browser...
                </span>
              ) : (
                "Allow Camera Access"
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full text-muted-foreground"
            >
              Ask Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

