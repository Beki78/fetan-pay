"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCameraPermissionContext } from "@/contexts/CameraPermissionContext";

// Props interface
interface UnifiedScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  scannerId?: string;
}

// Default props
const DEFAULT_PROPS = {
  title: "Scan QR Code",
  description: "Position QR code in frame",
  scannerId: "unified-qr-scanner",
};

// Scanner state
type ScannerStatus = "initializing" | "scanning" | "ready" | "error";

export function UnifiedScanner({
  onScan,
  onClose,
  title = DEFAULT_PROPS.title,
  description = DEFAULT_PROPS.description,
  scannerId = DEFAULT_PROPS.scannerId,
}: UnifiedScannerProps) {
  // Context
  const { permission, requestPermission } = useCameraPermissionContext();

  // State
  const [status, setStatus] = useState<ScannerStatus>("initializing");
  const [error, setError] = useState<string | null>(null);

  // Refs
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const isStartingRef = useRef(false);

  // Cleanup scanner
  const cleanupScanner = useCallback(async () => {
    if (isStartingRef.current) {
      // Wait for start to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        await scanner.stop();
        scannerRef.current = null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        // Ignore expected errors when scanner is already stopped
        if (
          !errorMessage.includes("Cannot stop") &&
          !errorMessage.includes("not running") &&
          !errorMessage.includes("transition")
        ) {
          console.error("Error stopping scanner:", err);
        }
        // Clean up reference anyway
        scannerRef.current = null;
      }
    }
  }, []);

  // Handle scan success
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Prevent duplicate scans
      if (hasScannedRef.current) {
        console.log("⚠️ [UnifiedScanner] Duplicate scan detected, ignoring");
        return;
      }
      hasScannedRef.current = true;

      console.log("📷 [UnifiedScanner] QR Code detected:", decodedText);

      // Stop scanner immediately
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop();
          scannerRef.current = null;
        }
      } catch (err) {
        // Ignore errors when stopping
        console.log("Scanner stop error (expected):", err);
      }

      // Call parent callbacks
      onScan(decodedText);
      onClose();
    },
    [onScan, onClose]
  );

  // Start scanning with retry logic
  const startScanning = useCallback(
    async (retryCount = 0) => {
      const MAX_RETRIES = 2;

      // Prevent concurrent start attempts
      if (isStartingRef.current) {
        return;
      }

      try {
        isStartingRef.current = true;
        hasScannedRef.current = false; // Reset scan flag
        setStatus("initializing");
        setError(null);

        // Check permission from context
        if (permission !== "granted") {
          console.log(
            "[UnifiedScanner] Permission not granted, requesting..."
          );
          const granted = await requestPermission();
          if (!granted) {
            throw new Error(
              "Camera permission denied. Please allow camera access in your browser settings and try again."
            );
          }
        }

        // Check if camera API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "Camera API not available. Please use HTTPS or a modern browser."
          );
        }

        // Small delay to ensure permission is fully processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Enumerate cameras
        const cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        // Select best camera (prefer rear camera)
        const backCamera =
          cameras.find(
            (cam) =>
              cam.label.toLowerCase().includes("back") ||
              cam.label.toLowerCase().includes("rear") ||
              cam.label.toLowerCase().includes("environment")
          ) || cameras[0]; // Fallback to first camera

        console.log(
          "[UnifiedScanner] Available cameras:",
          cameras.map((c) => ({ id: c.id, label: c.label }))
        );
        console.log("[UnifiedScanner] Selected camera:", {
          id: backCamera.id,
          label: backCamera.label,
        });

        // Initialize scanner
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        // Start scanner with optimal configuration
        await html5QrCode.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: true,
          },
          (decodedText) => {
            // QR code scanned successfully
            handleScanSuccess(decodedText).catch((error) => {
              console.error(
                "❌ [UnifiedScanner] Error in scan handler:",
                error
              );
              // Reset flag on error so user can try again
              hasScannedRef.current = false;
            });
          },
          () => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        );

        setStatus("ready");
      } catch (err) {
        const errMsg = err instanceof Error ? err.message.toLowerCase() : "";

        // Retry on transient errors
        const isRetryable =
          errMsg.includes("transition") ||
          errMsg.includes("state") ||
          errMsg.includes("in use") ||
          errMsg.includes("busy") ||
          errMsg.includes("notreadableerror");

        if (isRetryable && retryCount < MAX_RETRIES) {
          console.log(
            `[UnifiedScanner] Camera busy, retrying... (attempt ${
              retryCount + 2
            })`
          );
          isStartingRef.current = false;
          await new Promise((resolve) =>
            setTimeout(resolve, 500 * (retryCount + 1))
          );
          return startScanning(retryCount + 1);
        }

        // Map error to user-friendly message
        let errorMessage =
          "Unable to access camera. Please check permissions and try again.";

        if (err instanceof Error) {
          if (errMsg.includes("permission") || errMsg.includes("denied")) {
            errorMessage =
              "Camera permission denied. Please allow camera access in your browser settings and try again.";
          } else if (
            errMsg.includes("not found") ||
            errMsg.includes("no camera")
          ) {
            errorMessage =
              "No camera found. Please ensure your device has a camera.";
          } else if (
            errMsg.includes("not allowed") ||
            errMsg.includes("not permitted")
          ) {
            errorMessage =
              "Camera access not allowed. Please check your browser and device permissions.";
          } else if (errMsg.includes("https") || errMsg.includes("secure")) {
            errorMessage =
              "Camera requires HTTPS. Please access this site over a secure connection.";
          } else if (
            errMsg.includes("transition") ||
            errMsg.includes("state") ||
            errMsg.includes("in use") ||
            errMsg.includes("busy")
          ) {
            errorMessage =
              "Camera is busy. Please close other apps using the camera and try again.";
          } else {
            errorMessage = err.message || errorMessage;
          }
        }

        setError(errorMessage);
        setStatus("error");
        console.error("[UnifiedScanner] Scanner error:", err);
        toast.error("Camera access failed", {
          description: errorMessage,
          duration: 5000,
        });
      } finally {
        isStartingRef.current = false;
      }
    },
    [permission, requestPermission, scannerId, handleScanSuccess]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null);
    startScanning();
  }, [startScanning]);

  // Handle close
  const handleClose = useCallback(async () => {
    hasScannedRef.current = false; // Reset scan flag when closing manually
    await cleanupScanner();
    onClose();
  }, [cleanupScanner, onClose]);

  // Initialize scanner on mount
  useEffect(() => {
    startScanning();

    // Cleanup on unmount
    return () => {
      hasScannedRef.current = false;
      cleanupScanner().catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [startScanning, cleanupScanner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "ready"
                ? "Scanning..."
                : status === "initializing"
                ? "Initializing..."
                : description}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Scanner container */}
        <div
          id={scannerId}
          className="mb-4 rounded-lg overflow-hidden bg-muted"
        />

        {/* Loading state */}
        {status === "initializing" && !error && (
          <div className="mb-4 flex flex-col items-center justify-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">
              Initializing camera...
            </p>
          </div>
        )}

        {/* Ready state */}
        {status === "ready" && !error && (
          <div className="mb-4 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Camera ready - Scan QR code now
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Position the QR code within the frame
            </p>
          </div>
        )}

        {/* Error state with retry button */}
        {error && (
          <div className="text-center space-y-3">
            <Button variant="default" onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
