"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// Types
type PermissionState = "prompt" | "granted" | "denied" | "unknown";

interface CameraPermissionContextValue {
  permission: PermissionState;
  requestPermission: () => Promise<boolean>;
  isChecking: boolean;
  error: string | null;
  lastChecked: number | null;
}

interface StoredPermissionState {
  state: PermissionState;
  timestamp: number;
  grantedAt?: number;
}

// Context
const CameraPermissionContext = createContext<CameraPermissionContextValue | undefined>(undefined);

// Storage key
const STORAGE_KEY = "camera-permission-state";
const STORAGE_TTL = 5 * 60 * 1000; // 5 minutes

// Provider Props
interface CameraPermissionProviderProps {
  children: React.ReactNode;
}

// Provider Component
export function CameraPermissionProvider({ children }: CameraPermissionProviderProps) {
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  // Store permission state in sessionStorage
  const storePermissionState = useCallback((state: PermissionState) => {
    try {
      const stored: StoredPermissionState = {
        state,
        timestamp: Date.now(),
        grantedAt: state === "granted" ? Date.now() : undefined,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (err) {
      console.warn("Failed to store permission state:", err);
    }
  }, []);

  // Retrieve permission state from sessionStorage
  const retrieveStoredState = useCallback((): PermissionState | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: StoredPermissionState = JSON.parse(stored);
      
      // Check if stored state is still valid (within TTL)
      if (Date.now() - parsed.timestamp < STORAGE_TTL) {
        return parsed.state;
      }
      
      // Clear expired state
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (err) {
      console.warn("Failed to retrieve stored permission state:", err);
      return null;
    }
  }, []);

  // Update permission state and store it
  const updatePermissionState = useCallback((state: PermissionState) => {
    setPermission(state);
    setLastChecked(Date.now());
    storePermissionState(state);
  }, [storePermissionState]);

  // Check permission using Permissions API
  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    // 1. Check sessionStorage first
    const storedState = retrieveStoredState();
    if (storedState) {
      return storedState;
    }

    // 2. Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return "denied";
    }

    // 3. Try Permissions API
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        // Set up change listener for permission state changes
        result.onchange = () => {
          updatePermissionState(result.state as PermissionState);
        };

        return result.state as PermissionState;
      } catch (err) {
        // Permissions API not supported or query failed (Safari)
        console.warn("Permissions API query failed:", err);
        return "prompt";
      }
    }

    // 4. Fallback for Safari and browsers without Permissions API
    return "prompt";
  }, [retrieveStoredState, updatePermissionState]);

  // Request camera permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setError(null);
    
    try {
      // Request camera access via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      // Stop all tracks immediately (we just needed to check permission)
      stream.getTracks().forEach((track) => track.stop());
      
      // Update state to granted
      updatePermissionState("granted");
      return true;
    } catch (err) {
      // Handle different error types
      const error = err as Error;
      let errorMessage = "Camera permission denied";
      
      if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device";
      } else if (error.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is busy. Please close other apps using the camera and try again.";
      } else if (error.name === "SecurityError") {
        errorMessage = "Camera requires HTTPS. Please access this site over a secure connection.";
      }
      
      setError(errorMessage);
      updatePermissionState("denied");
      return false;
    }
  }, [updatePermissionState]);

  // Initialize permission checking on mount
  useEffect(() => {
    let mounted = true;

    const initializePermission = async () => {
      setIsChecking(true);
      
      try {
        const state = await checkPermission();
        
        if (mounted) {
          updatePermissionState(state);
        }
      } catch (err) {
        console.error("Failed to check permission:", err);
        
        if (mounted) {
          setPermission("unknown");
          setError("Failed to check camera permission");
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    initializePermission();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [checkPermission, updatePermissionState]);

  const value: CameraPermissionContextValue = {
    permission,
    requestPermission,
    isChecking,
    error,
    lastChecked,
  };

  return (
    <CameraPermissionContext.Provider value={value}>
      {children}
    </CameraPermissionContext.Provider>
  );
}

// Custom hook to use the context
export function useCameraPermissionContext(): CameraPermissionContextValue {
  const context = useContext(CameraPermissionContext);
  
  if (!context) {
    throw new Error(
      "useCameraPermissionContext must be used within CameraPermissionProvider"
    );
  }
  
  return context;
}
