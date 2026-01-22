"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useListEmailLogsQuery, useListSmsLogsQuery } from "@/lib/services/communicationsApi";
import { 
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LogType = 'email' | 'sms';

export default function CommunicationLogsPage() {
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [logType, setLogType] = useState<LogType>('email');
  
  const { data: emailData, isLoading: emailLoading, error: emailError } = useListEmailLogsQuery({
    page,
    pageSize,
  }, {
    skip: logType !== 'email'
  });

  const { data: smsData, isLoading: smsLoading, error: smsError } = useListSmsLogsQuery({
    page,
    pageSize,
  }, {
    skip: logType !== 'sms'
  });

  const isLoading = logType === 'email' ? emailLoading : smsLoading;
  const error = logType === 'email' ? emailError : smsError;
  const data = logType === 'email' ? emailData : smsData;

  // Reset page when switching log types
  const handleLogTypeChange = (newType: LogType) => {
    setLogType(newType);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading {logType} logs</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {(error as any)?.data?.message || `Failed to load ${logType} logs`}
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'QUEUED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all sent messages and their delivery status
        </p>
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/communications"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Compose Message
          </Link>
          <Link
            href="/communications/logs"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications/logs'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Message Logs
          </Link>
        </div>
      </div>

      {/* Log Type Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleLogTypeChange('email')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              logType === 'email'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📧 Email Logs
          </button>
          <button
            onClick={() => handleLogTypeChange('sms')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              logType === 'sms'
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📱 SMS Logs
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                {logType === 'email' ? 'Recipient Email' : 'Recipient Phone'}
              </th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                {logType === 'email' ? 'Subject' : 'Message Preview'}
              </th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Template</th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Status</th>
              {logType === 'sms' && (
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Segments</th>
              )}
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Sent At</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell className="p-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {logType === 'email' ? log.toEmail : log.toPhone}
                    </div>
                    {log.merchant && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.merchant.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {logType === 'email' ? log.subject : (
                      <div className="max-w-xs truncate">
                        {log.message}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  {log.template ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {log.template.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.template.category}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Custom</span>
                  )}
                </TableCell>
                <TableCell className="p-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                  {log.messageId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {log.messageId.substring(0, 8)}...
                    </div>
                  )}
                </TableCell>
                {logType === 'sms' && (
                  <TableCell className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.segmentCount} segment{log.segmentCount !== 1 ? 's' : ''}
                    </div>
                    {log.cost && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.cost.toFixed(2)} ETB
                      </div>
                    )}
                  </TableCell>
                )}
                <TableCell className="p-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(log.createdAt).toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No {logType} logs found
            </div>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.total)} of {data.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}