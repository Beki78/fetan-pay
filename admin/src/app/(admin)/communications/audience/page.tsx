"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, UserIcon, EnvelopeIcon, DownloadIcon } from "@/icons";
import { useGetAudiencePreviewMutation, AudienceSegmentType } from "@/lib/services/communicationsApi";

const AUDIENCE_SEGMENT_NAMES: Record<AudienceSegmentType, string> = {
  ALL_MERCHANTS: 'All Merchants',
  PENDING_MERCHANTS: 'Pending Approval',
  ACTIVE_MERCHANTS: 'Active Merchants',
  BANNED_USERS: 'Banned Users',
  INACTIVE_MERCHANTS: 'Inactive Merchants',
  HIGH_VOLUME_MERCHANTS: 'High Volume Merchants',
  NEW_SIGNUPS: 'New Signups',
  MERCHANT_OWNERS: 'Merchant Owners',
  WAITERS: 'Waiters',
  CUSTOM_FILTER: 'Custom Filter',
};

export default function AudiencePreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const segment = searchParams.get('segment') as AudienceSegmentType;
  
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const [getAudiencePreview] = useGetAudiencePreviewMutation();

  useEffect(() => {
    if (!segment) {
      setError('No audience segment specified');
      setLoading(false);
      return;
    }

    const fetchRecipients = async () => {
      try {
        setLoading(true);
        const result = await getAudiencePreview({
          segment,
        }).unwrap();
        
        setRecipients(result.preview);
        setTotalCount(result.count);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch audience preview:', err);
        setError('Failed to load audience recipients');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, [segment, getAudiencePreview]);

  const handleExportCSV = () => {
    if (recipients.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Merchant Name', 'Merchant ID'].join(','),
      ...recipients.map(recipient => [
        `"${recipient.name || ''}"`,
        `"${recipient.email || ''}"`,
        `"${recipient.phone || ''}"`,
        `"${recipient.role || ''}"`,
        `"${recipient.merchantName || ''}"`,
        `"${recipient.merchantId || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${segment.toLowerCase()}_recipients.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!segment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Invalid Request</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            No audience segment specified. Please go back and select an audience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/communications"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Communications
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Audience Preview: {AUDIENCE_SEGMENT_NAMES[segment]}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {loading ? 'Loading recipients...' : `${totalCount.toLocaleString()} total recipients`}
            </p>
          </div>
          
          {!loading && recipients.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && recipients.length === 0 && (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Recipients Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no recipients matching the selected audience criteria.
          </p>
        </div>
      )}

      {!loading && !error && recipients.length > 0 && (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recipients ({recipients.length} shown)
              </h3>
              {totalCount > recipients.length && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing first {recipients.length} of {totalCount.toLocaleString()} recipients
                </p>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recipients.map((recipient, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <UserIcon className=" text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {recipient.name || 'Unknown Name'}
                      </h4>
                      {recipient.role && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {recipient.role.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span className="truncate">{recipient.email}</span>
                      </div>
                      
                      {recipient.phone && (
                        <div className="flex items-center gap-1">
                          <span>📱</span>
                          <span className="truncate">{recipient.phone}</span>
                        </div>
                      )}
                      
                      {recipient.merchantName && (
                        <div className="flex items-center gap-1">
                          <span>🏪</span>
                          <span className="truncate">{recipient.merchantName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalCount > recipients.length && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <strong>Note:</strong> Only the first {recipients.length} recipients are shown for performance. 
                Export to CSV to get the complete list of {totalCount.toLocaleString()} recipients.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}