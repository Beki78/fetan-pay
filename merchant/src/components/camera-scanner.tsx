"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type BankId } from "@/lib/validation";

interface CameraScannerProps {
  onScan: (url: string) => void;
  onClose: () => void;
  selectedBank: BankId | null;
}

export function CameraScanner({
  onScan,
  onClose,
  selectedBank,
}: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isStartingRef = useRef(false);
  const hasScannedRef = useRef(false); // Prevent multiple scan callbacks
  const scannerId = "qr-reader";

  const stopScanning = async () => {
    // Prevent stopping while starting
    if (isStartingRef.current) {
      // Wait a bit for start to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (scannerRef.current && isScanning) {
      try {
        // Check if scanner is actually running before stopping
        const scanner = scannerRef.current;
        await scanner.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        // Ignore errors if scanner is already stopped or not running
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes("Cannot stop") ||
          errorMessage.includes("not running") ||
          errorMessage.includes("transition")
        ) {
          // Scanner is already stopped, just clean up
          scannerRef.current = null;
          setIsScanning(false);
        } else {
          console.error("Error stopping scanner:", err);
        }
      }
    } else {
      // Clean up state even if scanner wasn't running
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const startScanning = async () => {
    // Prevent concurrent start attempts
    if (isStartingRef.current || isScanning) {
      return;
    }

    try {
      isStartingRef.current = true;
      hasScannedRef.current = false; // Reset scan flag when starting

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera API not available. Please use HTTPS or a modern browser."
        );
      }

      // Enumerate available cameras
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        throw new Error("No cameras found on this device.");
      }

      // Find back camera by checking label
      const backCamera =
        cameras.find(
          (cam) =>
            cam.label.toLowerCase().includes("back") ||
            cam.label.toLowerCase().includes("rear") ||
            cam.label.toLowerCase().includes("environment")
        ) || cameras[0]; // Fallback to first camera if no back camera found

      console.log(
        "Available cameras:",
        cameras.map((c) => ({ id: c.id, label: c.label }))
      );
      console.log("Selected camera:", {
        id: backCamera.id,
        label: backCamera.label,
      });

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      // Start scanning with the selected camera ID
      await html5QrCode.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: true,
        },
        (decodedText) => {
          // QR code scanned successfully - prevent multiple callbacks
          // Set flag immediately to prevent race conditions
          if (hasScannedRef.current) {
            return; // Already processing a scan
          }
          hasScannedRef.current = true;

          // Call handler asynchronously to prevent blocking
          handleScanSuccess(decodedText).catch((error) => {
            console.error("❌ [SCANNER] Error in scan handler:", error);
            // Reset flag on error so user can try again
            hasScannedRef.current = false;
          });
        },
        () => {
          // Ignore scanning errors (they're frequent during scanning)
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      let errorMessage = "Unable to access camera. Please check permissions.";

      if (err instanceof Error) {
        const errMsg = err.message.toLowerCase();

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
        } else if (errMsg.includes("transition") || errMsg.includes("state")) {
          errorMessage =
            "Camera is already in use. Please wait a moment and try again.";
        } else {
          errorMessage = err.message || errorMessage;
        }
      }

      setError(errorMessage);
      console.error("Scanner error:", err);
      toast.error("Camera access failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      isStartingRef.current = false;
    }
  };

  useEffect(() => {
    startScanning();
    return () => {
      // Cleanup on unmount
      hasScannedRef.current = false; // Reset scan flag
      if (scannerRef.current) {
        stopScanning().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanSuccess = async (scannedUrl: string) => {
    console.log("📷 [SCANNER] QR Code detected:", scannedUrl);

    // Stop scanning (non-blocking)
    stopScanning().catch(() => {});

    // Pass URL to parent - parent handles everything
    onScan(scannedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Scan QR Code</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isScanning ? "Scanning..." : "Position QR code in frame"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              hasScannedRef.current = false; // Reset scan flag when closing manually
              await stopScanning();
              onClose();
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div
          id={scannerId}
          className="mb-4 rounded-lg overflow-hidden bg-muted"
        />

        {!isScanning && !error && (
          <div className="mb-4 flex flex-col items-center justify-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">
              Initializing camera...
            </p>
          </div>
        )}

        {isScanning && (
          <div className="mb-4 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Camera ready - Scan QR code now
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Position the QR code within the frame
            </p>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        )}
      </div>
    </div>
  );
}
