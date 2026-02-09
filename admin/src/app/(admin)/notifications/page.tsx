"use client";
import { useState } from "react";
import { useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from "@/lib/services/notificationsApi";
import { NotificationType, NotificationPriority } from "@/lib/services/notificationsApi";
import { formatDistanceToNow } from "date-fns";
import { BellIcon, CheckCircleIcon, CheckLineIcon } from "@/icons";

export default function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<NotificationType | "ALL">("ALL");
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);

  const { data: notificationsData, isLoading } = useGetNotificationsQuery({
    page: currentPage,
    limit: 20,
    type: filterType === "ALL" ? undefined : filterType,
    unread_only: filterRead === false ? false : filterRead === true ? undefined : undefined,
  });

  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = notificationsData?.data || [];
  const totalPages = notificationsData?.totalPages || 1;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Navigate to merchant detail page if it's a merchant-related notification
    if (notification.type === 'MERCHANT_REGISTRATION') {
      const merchantId = notification.merchantId || notification.data?.merchantId;
      console.log('Notification page click:', { 
        type: notification.type, 
        merchantId: notification.merchantId, 
        data: notification.data,
        finalMerchantId: merchantId 
      });
      if (merchantId) {
        window.open(`/users/${merchantId}`, '_blank');
      } else {
        console.warn('No merchantId found in notification:', notification);
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT_RECEIVED':
        return "💰";
      case 'PAYMENT_FAILED':
        return "❌";
      case 'SYSTEM_ALERT':
        return "⚠️";
      case 'MERCHANT_REGISTRATION':
      case 'TEAM_MEMBER_INVITED':
        return "👤";
      case 'MERCHANT_BANNED':
      case 'WEBHOOK_FAILED':
        return "🔒";
      default:
        return "📢";
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return "border-l-red-600 bg-red-50 dark:bg-red-900/20 dark:border-l-red-500";
      case 'HIGH':
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-l-orange-400";
      case 'MEDIUM':
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-l-yellow-400";
      case 'LOW':
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-l-gray-600";
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <CheckLineIcon className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NotificationType | "ALL")}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="PAYMENT_RECEIVED">Payment Received</option>
              <option value="PAYMENT_FAILED">Payment Failed</option>
              <option value="SYSTEM_ALERT">System Alert</option>
              <option value="MERCHANT_REGISTRATION">Merchant Registration</option>
              <option value="WEBHOOK_FAILED">Webhook Failed</option>
            </select>
            <select
              value={filterRead === undefined ? "ALL" : filterRead ? "read" : "UNREAD"}
              onChange={(e) => {
                const value = e.target.value;
                setFilterRead(value === "ALL" ? undefined : value === "read");
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="UNREAD">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterType !== "ALL" || filterRead !== undefined
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-lg p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                !notification.isRead ? getPriorityColor(notification.priority) : "border-l-gray-300 dark:border-l-gray-600 bg-white dark:bg-gray-800"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium ${!notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                      <span className="capitalize">{notification.type.replace('_', ' ').toLowerCase()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.priority === 'CRITICAL'
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          : notification.priority === 'HIGH'
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                          : notification.priority === 'MEDIUM'
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="ml-4 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}