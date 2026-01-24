"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Notification, NotificationType, NotificationPriority, useMarkAsReadMutation } from "@/lib/services/notificationsApi";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onItemClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, onItemClick }) => {
  const [markAsRead] = useMarkAsReadMutation();
  const router = useRouter();

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id).unwrap();
        onMarkAsRead?.(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Navigate to merchant detail page if it's a merchant-related notification
    if (notification.type === 'MERCHANT_REGISTRATION') {
      const merchantId = notification.merchantId || notification.data?.merchantId;
      console.log('Notification data:', { 
        type: notification.type, 
        merchantId: notification.merchantId, 
        data: notification.data,
        finalMerchantId: merchantId 
      });
      if (merchantId) {
        router.push(`/users/${merchantId}`);
      } else {
        console.warn('No merchantId found in notification:', notification);
      }
    }
    
    onItemClick?.();
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
      case 'HIGH':
      case 'CRITICAL':
        return "text-red-600 dark:text-red-400";
      case 'MEDIUM':
        return "text-yellow-600 dark:text-yellow-400";
      case 'LOW':
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div
      className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : "dark:bg-gray-900"
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0 text-lg">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${!notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
              {notification.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;