"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Button from "../ui/button/Button";
import { toast } from "sonner";

interface CameraScannerProps {
  onScan: (url: string) => void;
  onClose: () => void;
}

export function CameraScanner({
  onScan,
  onClose,
}: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isStartingRef = useRef(false);
  const hasScannedRef = useRef(false);
  const scannerId = "qr-reader-wallet";
  const retryCountRef = useRef(0);

  const stopScanning = async () => {
    if (isStartingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (scannerRef.current && isScanning) {
      try {
        const scanner = scannerRef.current;
        await scanner.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes("Cannot stop") ||
          errorMessage.includes("not running") ||
          errorMessage.includes("transition")
        ) {
          // Scanner is already stopped, just clean up
          scannerRef.current = null;
          setIsScanning(false);
        }
      }
    }
  };

  const startScanning = async () => {
    if (isStartingRef.current || isScanning) {
      return;
    }

    try {
      isStartingRef.current = true;
      hasScannedRef.current = false;
      setError(null);

      // Request camera permission explicitly
      await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("✅ [SCANNER] Camera permission granted.");

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        throw new Error("No cameras found on this device.");
      }

      const backCamera =
        cameras.find(
          (cam) =>
            cam.label.toLowerCase().includes("back") ||
            cam.label.toLowerCase().includes("rear") ||
            cam.label.toLowerCase().includes("environment")
        ) || cameras[0];

      console.log("Available cameras:", cameras.map((c) => ({ id: c.id, label: c.label })));
      console.log("Selected camera:", { id: backCamera.id, label: backCamera.label });

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: true,
        },
        (decodedText) => {
          if (hasScannedRef.current) {
            return;
          }
          hasScannedRef.current = true;

          handleScanSuccess(decodedText).catch((error) => {
            console.error("❌ [SCANNER] Error in scan handler:", error);
            hasScannedRef.current = false;
          });
        },
        () => {
          // Ignore scanning errors
        }
      );

      setIsScanning(true);
      setError(null);
      retryCountRef.current = 0;
    } catch (err) {
      let errorMessage = "Unable to access camera. Please check permissions.";
      if (err instanceof Error) {
        if (err.message.includes("Permission denied") || err.message.includes("NotAllowedError")) {
          errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
        } else if (err.message.includes("NotFoundError") || err.message.includes("no camera")) {
          errorMessage = "No camera found on this device.";
        } else if (err.message.includes("NotReadableError") || err.message.includes("busy")) {
          errorMessage = "Camera is busy or not accessible. Please close other apps using the camera.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Scanner error:", err);
      toast.error("Camera access failed", {
        description: errorMessage,
        duration: 5000,
      });
      setIsScanning(false);

      const errMsg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      if (
        retryCountRef.current < 2 &&
        (errMsg.includes("transition") || errMsg.includes("state") || errMsg.includes("busy"))
      ) {
        retryCountRef.current++;
        console.warn(`⚠️ [SCANNER] Camera busy, retrying (${retryCountRef.current}/2)...`);
        setTimeout(startScanning, retryCountRef.current * 1000);
      } else {
        retryCountRef.current = 0;
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  useEffect(() => {
    startScanning();
    return () => {
      hasScannedRef.current = false;
      if (scannerRef.current) {
        stopScanning().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanSuccess = async (scannedUrl: string) => {
    console.log("📷 [SCANNER] QR Code detected:", scannedUrl);

    stopScanning().catch(() => {});

    onScan(scannedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Scan QR Code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isScanning ? "Scanning..." : "Position QR code in frame"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              hasScannedRef.current = false;
              await stopScanning();
              onClose();
            }}
            className="border-gray-300 dark:border-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error ? (
          <div className="p-8 text-center space-y-4">
            <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>To fix this issue:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Allow camera permissions in your browser settings</li>
                <li>Ensure you&apos;re using HTTPS (secure connection)</li>
                <li>Try refreshing the page and granting permissions again</li>
                <li>Check your device&apos;s camera permissions in system settings</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-center mt-6">
              <Button
                variant="outline"
                onClick={async () => {
                  setError(null);
                  await startScanning();
                }}
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              id={scannerId}
              className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
            />

            {!isScanning && (
              <div className="mb-4 flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Initializing camera...
                </p>
              </div>
            )}

            {isScanning && (
              <div className="mb-4 text-center">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  ✓ Camera ready - Scan QR code now
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Position the QR code within the frame
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

