"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  validateTransactionInput,
  detectBankFromUrl,
  type BankId,
} from "@/lib/validation";

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
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            handleScanSuccess(decodedText);
          }
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
      if (scannerRef.current) {
        stopScanning().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanSuccess = async (scannedUrl: string) => {
    // Prevent multiple calls
    if (hasScannedRef.current) {
      return;
    }
    hasScannedRef.current = true;

    // Log the scanned URL
    console.log("Scanned QR URL:", scannedUrl);

    // Stop scanning first
    await stopScanning();

    // Try to detect bank from URL if not selected
    const detectedBank = selectedBank || detectBankFromUrl(scannedUrl);

    // Validate the scanned URL
    const validation = validateTransactionInput(detectedBank, scannedUrl);

    if (validation.isValid) {
      // URL is valid - show success toast
      const bankName = (detectedBank ||
        selectedBank ||
        "transaction") as string;
      toast.success("QR Code scanned successfully!", {
        description:
          detectedBank && !selectedBank
            ? `${bankName.toUpperCase()} detected and validated`
            : `Valid ${bankName.toUpperCase()} transaction detected`,
      });
      onScan(scannedUrl);
      onClose();
    } else {
      // URL validation failed
      if (selectedBank && !detectedBank) {
        // Bank mismatch
        toast.error("Bank mismatch", {
          description: `The scanned QR code does not match the selected bank (${(
            selectedBank as string
          ).toUpperCase()})`,
        });
      } else {
        // Invalid format
        toast.error("Invalid QR code", {
          description:
            validation.error ||
            "Unable to extract transaction reference from QR code",
        });
      }
      // Still pass the URL to parent, but show the error
      onScan(scannedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-4xl bg-card rounded-lg overflow-hidden shadow-2xl">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await stopScanning();
              onClose();
            }}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Scan QR Code
            </h2>
            <p className="text-sm text-muted-foreground">
              Position the QR code within the frame
            </p>
          </div>

          {error ? (
            <div className="p-8 text-center space-y-4">
              <p className="text-destructive mb-4 font-medium">{error}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>To fix this issue:</p>
                <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Allow camera permissions in your browser settings</li>
                  <li>Ensure you&apos;re using HTTPS (secure connection)</li>
                  <li>
                    Try refreshing the page and granting permissions again
                  </li>
                  <li>
                    Check your device&apos;s camera permissions in system
                    settings
                  </li>
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
              {/* Add CSS to fix duplicate video issue */}
              <style>{`
                #${scannerId} video {
                  width: 100% !important;
                  height: auto !important;
                  object-fit: cover !important;
                  transform: none !important;
                  display: block !important;
                }
                #${scannerId} {
                  position: relative !important;
                  overflow: hidden !important;
                  display: block !important;
                }
                #${scannerId} > div {
                  width: 100% !important;
                  height: 100% !important;
                  position: relative !important;
                }
                #${scannerId} canvas {
                  display: none !important;
                }
                #${scannerId} > div > video {
                  width: 100% !important;
                  height: auto !important;
                }
              `}</style>
              <div className="relative">
                <div
                  id={scannerId}
                  className="w-full rounded-lg overflow-hidden bg-black"
                  style={{ minHeight: "600px" }}
                />
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className="border-2 border-primary rounded-lg"
                      style={{ width: "400px", height: "400px" }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
