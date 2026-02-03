"use client";

import { useEffect, useState } from "react";

type PermissionState = "prompt" | "granted" | "denied" | "unknown";

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use `useCameraPermissionContext` from `@/contexts/CameraPermissionContext` instead.
 * 
 * The new context-based approach provides:
 * - Centralized permission state management
 * - Session storage persistence
 * - Automatic state propagation to all components
 * - Better error handling and recovery
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * import { useCameraPermission } from "@/hooks/useCameraPermission";
 * const { permission, requestPermission } = useCameraPermission();
 * 
 * // New:
 * import { useCameraPermissionContext } from "@/contexts/CameraPermissionContext";
 * const { permission, requestPermission } = useCameraPermissionContext();
 * ```
 */
export function useCameraPermission() {
  const [permission, setPermission] = useState<PermissionState>("unknown");

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermission("granted");
      return true;
    } catch {
      setPermission("denied");
      return false;
    }
  };

  useEffect(() => {
    // Check current permission status
    const checkPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermission("denied");
        return;
      }

      try {
        // Use Permissions API if available
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          setPermission(result.state as PermissionState);

          // Listen for permission changes
          result.onchange = () => {
            setPermission(result.state as PermissionState);
          };
        } else {
          // Fallback: try to get permission
          setPermission("prompt");
        }
      } catch {
        // Permissions API not supported, set to prompt
        setPermission("prompt");
      }
    };

    checkPermission();
  }, []);

  return { permission, requestPermission };
}

