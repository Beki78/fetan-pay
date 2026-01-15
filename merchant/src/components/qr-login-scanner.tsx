"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRLoginScannerProps {
  onScan: (qrData: string) => void;
  onClose: () => void;
}

export function QRLoginScanner({ onScan, onClose }: QRLoginScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isStartingRef = useRef(false);
  const hasScannedRef = useRef(false);
  const scannerId = "qr-login-reader";

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
          scannerRef.current = null;
          setIsScanning(false);
        } else {
          console.error("Error stopping scanner:", err);
        }
      }
    } else {
      setIsScanning(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const startScanning = async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    if (isStartingRef.current || isScanning) {
      return;
    }

    try {
      isStartingRef.current = true;
      hasScannedRef.current = false;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera API not available. Please use HTTPS or a modern browser."
        );
      }

      // Request permission first
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        throw new Error("Camera permission denied");
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

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
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            handleScanSuccess(decodedText);
          }
        },
        () => {
          // Ignore scanning errors
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message.toLowerCase() : "";

      // Retry on transient errors
      const isRetryable =
        errMsg.includes("transition") ||
        errMsg.includes("state") ||
        errMsg.includes("in use") ||
        errMsg.includes("busy");

      if (isRetryable && retryCount < MAX_RETRIES) {
        isStartingRef.current = false;
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (retryCount + 1))
        );
        return startScanning(retryCount + 1);
      }

      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error("Failed to start camera", {
        description: errorMessage,
      });
      setIsScanning(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      await stopScanning();
      onScan(decodedText);
    } catch (err) {
      console.error("Error handling scan:", err);
      toast.error("Failed to process QR code");
    }
  };

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Scan QR Code</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopScanning();
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

        {!error && (
          <p className="text-center text-sm text-muted-foreground">
            Position the QR code within the frame to scan
          </p>
        )}

        {error && (
          <Button
            variant="default"
            onClick={() => {
              setError(null);
              startScanning();
            }}
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
