"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, PieChartIcon, UserIcon, EnvelopeIcon, EyeIcon } from "@/icons";
import { 
  useGetAnalyticsOverviewQuery,
  useGetEngagementTrendsQuery,
  useGetTopCampaignsQuery 
} from "@/lib/services/communicationsApi";

export default function CommunicationsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverviewQuery({ days: timeRange });
  const { data: trends, isLoading: trendsLoading } = useGetEngagementTrendsQuery({ days: timeRange });
  const { data: topCampaigns, isLoading: campaignsLoading } = useGetTopCampaignsQuery({ limit: 5 });

  const isLoading = overviewLoading || trendsLoading || campaignsLoading;

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
              Email Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track email performance and engagement metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  overview?.totalEmails.toLocaleString() || '0'
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">+12.5%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  `${overview?.deliveryRate || 0}%`
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">+2.1%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  `${overview?.openRate || 0}%`
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">+5.3%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  `${overview?.clickRate || 0}%`
                )}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <UserIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">+3.7%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends Chart */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Engagement Trends
          </h3>
          
          <div className="space-y-4">
            {trendsLoading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1 w-16"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              ))
            ) : trends && trends.length > 0 ? (
              trends.map((trend) => (
                <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(trend.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {trend.emailsSent.toLocaleString()} sent
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {trend.openRate}% open
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {trend.clickRate}% click
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No engagement data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Campaigns */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Campaigns
          </h3>
          
          <div className="space-y-4">
            {campaignsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                    </div>
                    <div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : topCampaigns && topCampaigns.length > 0 ? (
              topCampaigns.map((campaign, index) => (
                <div key={campaign.campaignId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {campaign.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {campaign.sentCount.toLocaleString()} recipients • {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : 'Not sent'}
                      </p>
                    </div>
                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Open Rate</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.openRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Click Rate</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.clickRate}%
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No campaign data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="mt-8 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              ) : (
                overview?.totalSent.toLocaleString() || '0'
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Emails Sent</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              ) : (
                overview?.totalDelivered.toLocaleString() || '0'
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Delivered</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              ) : (
                overview?.totalOpened.toLocaleString() || '0'
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Opened</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              ) : (
                overview?.totalClicked.toLocaleString() || '0'
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Clicked</div>
          </div>
        </div>
      </div>
    </div>
  );
}