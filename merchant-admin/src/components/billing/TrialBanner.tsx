"use client";

import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
import { AlertTriangleIcon, ClockIcon } from '@/icons';

export default function TrialBanner() {
  const { isInTrial, isExpired, daysRemaining, plan } = useSubscription();

  // Don't show banner if not in trial or expired
  if (!isInTrial && !isExpired) {
    return null;
  }

  // Show expired banner
  if (isExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-700">
              <strong>Your free trial has expired.</strong> Upgrade to a paid plan to continue using FetanPay services.
            </p>
          </div>
          <div className="ml-4">
            <Link
              href="/billing"
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show trial warning
  const isUrgent = daysRemaining !== null && daysRemaining <= 2;
  const bgColor = isUrgent ? 'bg-orange-50 border-orange-400' : 'bg-blue-50 border-blue-400';
  const textColor = isUrgent ? 'text-orange-700' : 'text-blue-700';
  const iconColor = isUrgent ? 'text-orange-400' : 'text-blue-400';
  const buttonColor = isUrgent 
    ? 'bg-orange-600 hover:bg-orange-700' 
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className={`${bgColor} border-l-4 p-4 mb-6`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <ClockIcon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColor}`}>
            <strong>Free Trial Active:</strong> {' '}
            {daysRemaining !== null && daysRemaining > 0 
              ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
              : 'Expires today'
            } in your 7-day free trial. Upgrade to continue using all features.
          </p>
        </div>
        <div className="ml-4">
          <Link
            href="/billing"
            className={`${buttonColor} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  );
}