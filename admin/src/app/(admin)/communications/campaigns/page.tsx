"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useListCampaignsQuery, useSendCampaignMutation, usePauseCampaignMutation, useCancelCampaignMutation } from "@/lib/services/communicationsApi";
import { 
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { PlusIcon, PaperPlaneIcon, PieChartIcon, TrashBinIcon, TimeIcon } from "@/icons";

export default function CampaignsPage() {
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  const { data, isLoading, error } = useListCampaignsQuery({
    page,
    pageSize,
  });

  const [sendCampaign] = useSendCampaignMutation();
  const [pauseCampaign] = usePauseCampaignMutation();
  const [cancelCampaign] = useCancelCampaignMutation();

  const handleSendCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      try {
        await sendCampaign(campaignId).unwrap();
        alert('Campaign sending started!');
      } catch (error) {
        alert('Failed to send campaign. Please try again.');
      }
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign(campaignId).unwrap();
      alert('Campaign paused successfully!');
    } catch (error) {
      alert('Failed to pause campaign. Please try again.');
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to cancel this campaign?')) {
      try {
        await cancelCampaign(campaignId).unwrap();
        alert('Campaign cancelled successfully!');
      } catch (error) {
        alert('Failed to cancel campaign. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'SENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PAUSED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SMS':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'BOTH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
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
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading campaigns</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {(error as any)?.data?.message || 'Failed to load campaigns'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Campaigns
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage bulk email campaigns and track their performance
            </p>
          </div>
          <Link href="/communications/campaigns/create">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
        
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
            href="/communications/campaigns"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications/campaigns'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Campaigns
          </Link>
          <Link
            href="/communications/logs"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              pathname === '/communications/logs'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Email Logs
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Campaign</th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Type</th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Status</th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Progress</th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Created</th>
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Actions</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="p-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </div>
                    {campaign.template && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Template: {campaign.template.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
                    {campaign.type}
                  </span>
                </TableCell>
                <TableCell className="p-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </TableCell>
                <TableCell className="p-4">
                  <div className="text-sm">
                    <div className="text-gray-900 dark:text-white">
                      {campaign.sentCount} / {campaign.targetCount} sent
                    </div>
                    {campaign.targetCount > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(campaign.sentCount / campaign.targetCount) * 100}%` }}
                        ></div>
                      </div>
                    )}
                    {campaign.failedCount > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {campaign.failedCount} failed
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(campaign.createdAt).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center gap-2">
                    {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
                      <button
                        onClick={() => handleSendCampaign(campaign.id)}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Send Campaign"
                      >
                        <PaperPlaneIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    {campaign.status === 'SENDING' && (
                      <button
                        onClick={() => handlePauseCampaign(campaign.id)}
                        className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                        title="Pause Campaign"
                      >
                        <TimeIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED' || campaign.status === 'PAUSED') && (
                      <button
                        onClick={() => handleCancelCampaign(campaign.id)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Cancel Campaign"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <Link
                      href={`/communications/campaigns/${campaign.id}`}
                      className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <PieChartIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No campaigns found. Create your first campaign to get started.
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