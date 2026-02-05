import { renderHook } from "@testing-library/react";
import { useCameraPermissionContext, CameraPermissionProvider } from "../contexts/CameraPermissionContext";

describe("useCameraPermissionContext", () => {
  it("should throw error when used outside of provider", () => {
    // Suppress console.error for this test since we expect an error
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useCameraPermissionContext());
    }).toThrow("useCameraPermissionContext must be used within CameraPermissionProvider");
    
    consoleError.mockRestore();
  });

  it("should return context value when used within provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CameraPermissionProvider>{children}</CameraPermissionProvider>
    );

    const { result } = renderHook(() => useCameraPermissionContext(), { wrapper });

    // Verify the hook returns the expected context value structure
    expect(result.current).toHaveProperty("permission");
    expect(result.current).toHaveProperty("requestPermission");
    expect(result.current).toHaveProperty("isChecking");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("lastChecked");
    
    // Verify types
    expect(typeof result.current.requestPermission).toBe("function");
    expect(typeof result.current.isChecking).toBe("boolean");
  });

  it("should provide access to permission state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CameraPermissionProvider>{children}</CameraPermissionProvider>
    );

    const { result } = renderHook(() => useCameraPermissionContext(), { wrapper });

    // Permission should be one of the valid states
    expect(["prompt", "granted", "denied", "unknown"]).toContain(result.current.permission);
  });
});
