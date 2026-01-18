"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface Session {
  id: string;
  token: string;
  expiresAt: Date | string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date | string;
}

const getDeviceIcon = (device: string) => {
  if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("mobile")) {
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (device.toLowerCase().includes("mac") || device.toLowerCase().includes("laptop")) {
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
};

const formatLastActive = (dateString: Date | string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

const parseUserAgent = (userAgent?: string) => {
  if (!userAgent) return { device: "Unknown", browser: "Unknown" };
  
  // Simple parsing - can be enhanced
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isMac = /Mac|Macintosh/i.test(userAgent);
  const isWindows = /Windows/i.test(userAgent);
  
  let device = "Desktop";
  if (isMobile) device = "Mobile";
  else if (isMac) device = "Mac";
  else if (isWindows) device = "Windows";
  
  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  
  return { device, browser };
};

export default function ActiveSessions() {
  const { user, session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Fetch sessions on mount
  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // Use listSessions() for current user's sessions (not admin method)
      const result = await authClient.listSessions();

      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch sessions");
      }

      // Better Auth returns sessions array directly
      const sessionsList = (result.data as any)?.sessions || result.data || [];
      setSessions(sessionsList);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast.error(error?.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    try {
      // Use revokeSession() with token (not sessionId)
      const result = await authClient.revokeSession({
        token: sessionToken,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to revoke session");
      }

      toast.success("Session revoked successfully");
      // Refresh sessions list
      await fetchSessions();
    } catch (error: any) {
      console.error("Error revoking session:", error);
      toast.error(error?.message || "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      // Use revokeOtherSessions() - Better Auth built-in method
      const result = await authClient.revokeOtherSessions();

      if (result.error) {
        throw new Error(result.error.message || "Failed to revoke other sessions");
      }

      toast.success("All other sessions revoked successfully");
      // Refresh sessions list
      await fetchSessions();
    } catch (error: any) {
      console.error("Error revoking all sessions:", error);
      toast.error(error?.message || "Failed to revoke sessions");
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Active Sessions
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage devices that are currently signed in to your account
          </p>
        </div>
        {sessions.filter((s) => s.token !== session?.token && s.id !== session?.id).length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRevokeAll}
            className="lg:inline-flex"
          >
            Revoke All Other Sessions
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading sessions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            // Compare by token to identify current session
            const isCurrent = sess.token === session?.token || sess.id === session?.id;
            const { device, browser } = parseUserAgent(sess.userAgent);
            const lastActive = sess.createdAt || sess.expiresAt;
            
            return (
              <div
                key={sess.id || sess.token}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {getDeviceIcon(device)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {device}
                    </p>
                    {isCurrent && (
                      <Badge size="sm" color="success">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{browser}</span>
                    {sess.ipAddress && (
                      <>
                        <span>•</span>
                        <span>{sess.ipAddress}</span>
                      </>
                    )}
                    {lastActive && (
                      <>
                        <span>•</span>
                        <span>{formatLastActive(lastActive)}</span>
                      </>
                    )}
                  </div>
                </div>

                {!isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevoke(sess.token)}
                    disabled={revokingId === sess.token}
                    className="shrink-0"
                  >
                    {revokingId === sess.token ? "Revoking..." : "Revoke"}
                  </Button>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No active sessions found
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Security Tip
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              If you notice any suspicious activity, revoke all sessions
              immediately and change your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

