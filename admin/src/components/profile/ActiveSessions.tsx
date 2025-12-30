"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

// Mock data
const mockSessions = [
  {
    id: "1",
    device: "Windows",
    browser: "Chrome",
    location: "Addis Ababa, Ethiopia",
    ipAddress: "192.168.1.100",
    lastActive: "2024-01-15T10:30:00Z",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone",
    browser: "Safari",
    location: "Addis Ababa, Ethiopia",
    ipAddress: "192.168.1.101",
    lastActive: "2024-01-14T15:20:00Z",
    isCurrent: false,
  },
  {
    id: "3",
    device: "MacBook Pro",
    browser: "Chrome",
    location: "Addis Ababa, Ethiopia",
    ipAddress: "192.168.1.102",
    lastActive: "2024-01-13T09:15:00Z",
    isCurrent: false,
  },
];

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

const formatLastActive = (dateString: string) => {
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

export default function ActiveSessions() {
  const [sessions, setSessions] = useState(mockSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    // Mock API call
    setTimeout(() => {
      setSessions(sessions.filter((s) => s.id !== sessionId));
      setRevokingId(null);
    }, 1000);
  };

  const handleRevokeAll = async () => {
    // Mock API call
    setTimeout(() => {
      setSessions(sessions.filter((s) => s.isCurrent));
    }, 1000);
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
        {sessions.filter((s) => !s.isCurrent).length > 0 && (
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

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {getDeviceIcon(session.device)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {session.device}
                </p>
                {session.isCurrent && (
                  <Badge size="sm" color="success">
                    Current Session
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{session.browser}</span>
                <span>•</span>
                <span>{session.location}</span>
                <span>•</span>
                <span>{session.ipAddress}</span>
                <span>•</span>
                <span>{formatLastActive(session.lastActive)}</span>
              </div>
            </div>

            {!session.isCurrent && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRevoke(session.id)}
                disabled={revokingId === session.id}
                className="flex-shrink-0"
              >
                {revokingId === session.id ? "Revoking..." : "Revoke"}
              </Button>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No active sessions found
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
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

