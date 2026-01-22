"use client";
import React, { useState } from "react";
import { PieChartIcon, EnvelopeIcon, ChatIcon, UserIcon, DollarLineIcon, PaperPlaneIcon, CheckCircleIcon } from "@/icons";

interface AnalyticsData {
  totalCampaigns: number;
  totalMessages: number;
  emailMetrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  smsMetrics: {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  };
  monthlyTrends: {
    month: string;
    emailsSent: number;
    smsSent: number;
    cost: number;
  }[];
}

// Mock data - replace with API calls later
const MOCK_ANALYTICS: AnalyticsData = {
  totalCampaigns: 24,
  totalMessages: 15680,
  emailMetrics: {
    sent: 12450,
    delivered: 12234,
    opened: 8956,
    clicked: 2341,
    bounced: 216,
    unsubscribed: 45
  },
  smsMetrics: {
    sent: 3230,
    delivered: 3156,
    failed: 74,
    cost: 807.50
  },
  monthlyTrends: [
    { month: 'Oct 2025', emailsSent: 8945, smsSent: 2134, cost: 533.50 },
    { month: 'Nov 2025', emailsSent: 11230, smsSent: 2890, cost: 722.50 },
    { month: 'Dec 2025', emailsSent: 13450, smsSent: 3456, cost: 864.00 },
    { month: 'Jan 2026', emailsSent: 12450, smsSent: 3230, cost: 807.50 }
  ]
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function MetricCard({ title, value, subtitle, icon, color, trend }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CommunicationAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const analytics = MOCK_ANALYTICS;

  const emailOpenRate = Math.round((analytics.emailMetrics.opened / analytics.emailMetrics.delivered) * 100);
  const emailClickRate = Math.round((analytics.emailMetrics.clicked / analytics.emailMetrics.delivered) * 100);
  const smsDeliveryRate = Math.round((analytics.smsMetrics.delivered / analytics.smsMetrics.sent) * 100);
  const avgCostPerSMS = analytics.smsMetrics.cost / analytics.smsMetrics.sent;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Communication Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track performance and engagement metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={analytics.totalCampaigns}
          subtitle="Active communication campaigns"
          icon={<PieChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          color="bg-blue-100 dark:bg-blue-900/20"
          trend={{ value: 12, isPositive: true }}
        />
        
        <MetricCard
          title="Messages Sent"
          value={analytics.totalMessages}
          subtitle="Total email + SMS sent"
          icon={<PaperPlaneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
          color="bg-green-100 dark:bg-green-900/20"
          trend={{ value: 8, isPositive: true }}
        />
        
        <MetricCard
          title="Email Open Rate"
          value={`${emailOpenRate}%`}
          subtitle={`${analytics.emailMetrics.opened.toLocaleString()} of ${analytics.emailMetrics.delivered.toLocaleString()} delivered`}
          icon={<EnvelopeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          color="bg-purple-100 dark:bg-purple-900/20"
          trend={{ value: 3, isPositive: true }}
        />
        
        <MetricCard
          title="SMS Delivery Rate"
          value={`${smsDeliveryRate}%`}
          subtitle={`${analytics.smsMetrics.delivered.toLocaleString()} delivered`}
          icon={<ChatIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
          color="bg-orange-100 dark:bg-orange-900/20"
          trend={{ value: 1, isPositive: false }}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Analytics */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Email Performance
            </h3>
          </div>

          <div className="space-y-4">
            {/* Email Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.emailMetrics.sent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.emailMetrics.delivered.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.emailMetrics.opened.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Opened ({emailOpenRate}%)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics.emailMetrics.clicked.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clicked ({emailClickRate}%)</div>
              </div>
            </div>

            {/* Email Issues */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Issues to Address
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Bounced emails:</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {analytics.emailMetrics.bounced}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Unsubscribed:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    {analytics.emailMetrics.unsubscribed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Analytics */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChatIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              SMS Performance
            </h3>
          </div>

          <div className="space-y-4">
            {/* SMS Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.smsMetrics.sent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.smsMetrics.delivered.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered ({smsDeliveryRate}%)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {analytics.smsMetrics.failed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {avgCostPerSMS.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">ETB per SMS</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Cost Analysis
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total SMS cost:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {analytics.smsMetrics.cost.toFixed(2)} ETB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Average per message:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {avgCostPerSMS.toFixed(3)} ETB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Email cost:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Free tier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
          Monthly Trends
        </h3>
        
        {/* Simple Chart Placeholder */}
        <div className="space-y-4">
          {analytics.monthlyTrends.map((trend, index) => {
            const totalMessages = trend.emailsSent + trend.smsSent;
            const emailPercentage = (trend.emailsSent / totalMessages) * 100;
            const smsPercentage = (trend.smsSent / totalMessages) * 100;
            
            return (
              <div key={trend.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {trend.month}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {totalMessages.toLocaleString()} total
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {trend.cost.toFixed(2)} ETB
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-blue-500 dark:bg-blue-400"
                      style={{ width: `${emailPercentage}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 dark:bg-green-400"
                      style={{ width: `${smsPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>📧 {trend.emailsSent.toLocaleString()} emails</span>
                  <span>📱 {trend.smsSent.toLocaleString()} SMS</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">SMS</span>
          </div>
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Templates */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top Performing Templates
          </h3>
          
          <div className="space-y-3">
            {[
              { name: 'Welcome New Merchant', opens: 892, rate: 89 },
              { name: 'Payment Reminder SMS', delivered: 456, rate: 98 },
              { name: 'Security Alert', opens: 234, rate: 76 },
              { name: 'Feature Announcement', opens: 567, rate: 45 }
            ].map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {template.opens || template.delivered} engagements
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${
                    template.rate >= 80 ? 'text-green-600 dark:text-green-400' :
                    template.rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {template.rate}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {template.rate >= 80 ? 'Excellent' : template.rate >= 60 ? 'Good' : 'Needs work'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            {[
              { 
                action: 'Campaign sent', 
                details: 'Security Update Notification to 1,205 users',
                time: '2 hours ago',
                type: 'BOTH',
                status: 'success'
              },
              { 
                action: 'Template created', 
                details: 'Feature Announcement template',
                time: '1 day ago',
                type: 'EMAIL',
                status: 'info'
              },
              { 
                action: 'Campaign scheduled', 
                details: 'Payment Reminder to 89 high-volume merchants',
                time: '2 days ago',
                type: 'SMS',
                status: 'info'
              },
              { 
                action: 'Campaign completed', 
                details: 'Welcome New Merchants - 98% delivery rate',
                time: '3 days ago',
                type: 'EMAIL',
                status: 'success'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.action}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.details}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {activity.time}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      activity.type === 'EMAIL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      activity.type === 'SMS' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          💡 Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-300">
              Email Optimization
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• A/B test subject lines to improve {emailOpenRate}% open rate</li>
              <li>• Segment audience for better targeting</li>
              <li>• Clean bounced email addresses</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-purple-800 dark:text-purple-300">
              SMS Optimization
            </h4>
            <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <li>• {smsDeliveryRate}% delivery rate is excellent</li>
              <li>• Consider shorter messages to reduce costs</li>
              <li>• Send during business hours (8AM-8PM)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
