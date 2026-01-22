"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";
import { PlusIcon, EyeIcon, PieChartIcon, TrashBinIcon, TimeIcon, PaperPlaneIcon, CheckCircleIcon } from "@/icons";
import { 
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Campaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'BOTH';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  subject?: string;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  cost: number;
  createdAt: string;
  createdBy: string;
}

// Mock data - replace with API calls later
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Welcome New Merchants - Q1 2026',
    type: 'EMAIL',
    status: 'SENT',
    subject: 'Welcome to FetanPay! Your journey starts here',
    targetCount: 156,
    sentCount: 156,
    deliveredCount: 152,
    failedCount: 4,
    sentAt: '2026-01-15T10:30:00Z',
    cost: 0,
    createdAt: '2026-01-15T09:00:00Z',
    createdBy: 'Admin User'
  },
  {
    id: '2', 
    name: 'Payment Reminder - High Volume Merchants',
    type: 'SMS',
    status: 'SCHEDULED',
    targetCount: 89,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    scheduledAt: '2026-01-20T14:00:00Z',
    cost: 22.25,
    createdAt: '2026-01-18T16:45:00Z',
    createdBy: 'Admin User'
  },
  {
    id: '3',
    name: 'Security Update Notification',
    type: 'BOTH',
    status: 'SENDING',
    subject: 'Important Security Update - Action Required',
    targetCount: 1205,
    sentCount: 856,
    deliveredCount: 834,
    failedCount: 22,
    sentAt: '2026-01-18T11:00:00Z',
    cost: 301.25,
    createdAt: '2026-01-18T10:30:00Z',
    createdBy: 'Admin User'
  },
  {
    id: '4',
    name: 'Feature Announcement - Mobile App',
    type: 'EMAIL',
    status: 'DRAFT',
    subject: 'Introducing our new mobile app!',
    targetCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    cost: 0,
    createdAt: '2026-01-18T14:20:00Z',
    createdBy: 'Admin User'
  }
];

const getStatusColor = (status: Campaign['status']) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'SENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'SENT':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'FAILED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getTypeColor = (type: Campaign['type']) => {
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

export default function CampaignManagement() {
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return 0;
    return Math.round((campaign.deliveredCount / campaign.sentCount) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Campaign Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and track your communication campaigns
          </p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <PaperPlaneIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  (campaigns.reduce((sum, c) => sum + c.deliveredCount, 0) / 
                   Math.max(campaigns.reduce((sum, c) => sum + c.sentCount, 0), 1)) * 100
                )}%
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaigns.reduce((sum, c) => sum + c.cost, 0).toFixed(2)} ETB
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Campaigns
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/80">
              <TableRow>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Campaign
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recipients
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Delivery
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {campaign.name}
                      </div>
                      {campaign.subject && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {campaign.subject}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
                      {campaign.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white font-medium">
                        {campaign.targetCount.toLocaleString()}
                      </div>
                      {campaign.sentCount > 0 && (
                        <div className="text-gray-500 dark:text-gray-400">
                          {campaign.sentCount.toLocaleString()} sent
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {campaign.sentCount > 0 ? (
                      <div className="text-sm">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {getDeliveryRate(campaign)}%
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {campaign.deliveredCount}/{campaign.sentCount}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {campaign.cost > 0 ? `${campaign.cost.toFixed(2)} ETB` : 'Free'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {campaign.sentAt ? formatDate(campaign.sentAt) : 
                       campaign.scheduledAt ? `Scheduled: ${formatDate(campaign.scheduledAt)}` :
                       formatDate(campaign.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      
                      {campaign.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                        >
                          <PaperPlaneIcon className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Campaign Details
              </h3>
              <Button
                variant="outline"
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-600 dark:text-gray-400"
              >
                Close
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Campaign Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Campaign Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedCampaign.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedCampaign.type)}`}>
                        {selectedCampaign.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                        {selectedCampaign.status}
                      </span>
                    </div>
                    {selectedCampaign.subject && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedCampaign.subject}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Performance Metrics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Target Recipients:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedCampaign.targetCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Messages Sent:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedCampaign.sentCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {selectedCampaign.deliveredCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {selectedCampaign.failedCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Rate:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {getDeliveryRate(selectedCampaign)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedCampaign.cost > 0 ? `${selectedCampaign.cost.toFixed(2)} ETB` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Campaign Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white ml-2">
                        {formatDate(selectedCampaign.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedCampaign.scheduledAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Scheduled:</span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {formatDate(selectedCampaign.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedCampaign.sentAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sent:</span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {formatDate(selectedCampaign.sentAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
