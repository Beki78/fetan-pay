"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import { UserIcon, ChevronDownIcon, CheckCircleIcon } from "@/icons";
import { 
  useGetAudienceCountMutation,
  useGetAudiencePreviewMutation,
  AudienceSegmentType 
} from "@/lib/services/communicationsApi";

interface AudienceSegment {
  id: AudienceSegmentType;
  name: string;
  description: string;
  count: number;
  icon: string;
  color: string;
}

interface AudienceSelectorProps {
  onSelect: (audience: any) => void;
  selected: any;
}

// Audience segment definitions with real API integration
const AUDIENCE_SEGMENT_DEFINITIONS = [
  {
    id: 'ALL_MERCHANTS' as AudienceSegmentType,
    name: 'All Merchants',
    description: 'Every merchant in the system',
    icon: '🏪',
    color: 'blue'
  },
  {
    id: 'PENDING_MERCHANTS' as AudienceSegmentType, 
    name: 'Pending Approval',
    description: 'Merchants awaiting admin approval',
    icon: '⏳',
    color: 'orange'
  },
  {
    id: 'ACTIVE_MERCHANTS' as AudienceSegmentType,
    name: 'Active Merchants', 
    description: 'Approved and active merchants',
    icon: '✅',
    color: 'green'
  },
  {
    id: 'BANNED_USERS' as AudienceSegmentType,
    name: 'Banned Users',
    description: 'Users who have been banned', 
    icon: '🚫',
    color: 'red'
  },
  {
    id: 'INACTIVE_MERCHANTS' as AudienceSegmentType,
    name: 'Inactive Merchants',
    description: 'No login in last 30 days',
    icon: '😴',
    color: 'gray'
  },
  {
    id: 'HIGH_VOLUME_MERCHANTS' as AudienceSegmentType,
    name: 'High Volume Merchants',
    description: '1000+ ETB transactions last month',
    icon: '💰',
    color: 'purple'
  },
  {
    id: 'NEW_SIGNUPS' as AudienceSegmentType,
    name: 'New Signups',
    description: 'Registered in last 7 days',
    icon: '🆕',
    color: 'cyan'
  },
  {
    id: 'MERCHANT_OWNERS' as AudienceSegmentType,
    name: 'Merchant Owners',
    description: 'Business owners only',
    icon: '👔',
    color: 'indigo'
  },
  {
    id: 'WAITERS' as AudienceSegmentType,
    name: 'Waiters',
    description: 'Restaurant/cafe staff',
    icon: '🍽️',
    color: 'pink'
  }
];

const getColorClasses = (color: string, isSelected: boolean) => {
  const colors = {
    blue: isSelected 
      ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300"
      : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20",
    orange: isSelected
      ? "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-300"
      : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/10 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20",
    green: isSelected
      ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20",
    red: isSelected
      ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300"
      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20",
    gray: isSelected
      ? "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700",
    purple: isSelected
      ? "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300"
      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/10 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20",
    cyan: isSelected
      ? "bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-600 dark:text-cyan-300"
      : "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900/10 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-900/20",
    indigo: isSelected
      ? "bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-600 dark:text-indigo-300"
      : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20",
    pink: isSelected
      ? "bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900/30 dark:border-pink-600 dark:text-pink-300"
      : "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/10 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-900/20"
  };
  
  return colors[color as keyof typeof colors] || colors.gray;
};

export default function AudienceSelector({ onSelect, selected }: AudienceSelectorProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [getAudienceCount] = useGetAudienceCountMutation();
  const [getAudiencePreview] = useGetAudiencePreviewMutation();

  // Fetch audience counts for all segments on component mount
  useEffect(() => {
    const fetchAudienceCounts = async () => {
      setLoading(true);
      try {
        const segmentsWithCounts = await Promise.all(
          AUDIENCE_SEGMENT_DEFINITIONS.map(async (segment) => {
            try {
              const result = await getAudienceCount({
                segment: segment.id,
              }).unwrap();
              
              return {
                ...segment,
                count: result.count,
              };
            } catch (error) {
              console.error(`Failed to get count for ${segment.id}:`, error);
              return {
                ...segment,
                count: 0, // Fallback to 0 if API fails
              };
            }
          })
        );
        
        setAudienceSegments(segmentsWithCounts);
      } catch (error) {
        console.error('Failed to fetch audience counts:', error);
        // Fallback to definitions with 0 counts
        setAudienceSegments(AUDIENCE_SEGMENT_DEFINITIONS.map(segment => ({
          ...segment,
          count: 0,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAudienceCounts();
  }, [getAudienceCount]);

  const handleSegmentSelect = async (segment: AudienceSegment) => {
    try {
      // Get both count and preview data
      const [countResult, previewResult] = await Promise.all([
        getAudienceCount({ segment: segment.id }).unwrap(),
        getAudiencePreview({ segment: segment.id }).unwrap(),
      ]);

      onSelect({
        id: segment.id,
        name: segment.name,
        count: countResult.count,
        preview: previewResult.preview,
        criteria: { segment: segment.id }
      });
    } catch (error) {
      console.error('Failed to get audience data:', error);
      // Fallback to basic selection without preview
      onSelect({
        id: segment.id,
        name: segment.name,
        count: segment.count,
        preview: [],
        criteria: { segment: segment.id }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Audience Segments */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AUDIENCE_SEGMENT_DEFINITIONS.map((segment) => (
              <div
                key={segment.id}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {audienceSegments.map((segment) => {
              const isSelected = selected?.id === segment.id;
              return (
                <button
                  key={segment.id}
                  onClick={() => handleSegmentSelect(segment)}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${getColorClasses(segment.color, isSelected)}`}
                >
                  {isSelected && (
                    <CheckCircleIcon className="w-5 h-5 absolute top-2 right-2" />
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{segment.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {segment.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {segment.count.toLocaleString()} users
                      </div>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 leading-tight">
                    {segment.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-2"
        >
          Advanced Filters
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="">All Roles</option>
                <option value="MERCHANT_OWNER">Merchant Owners</option>
                <option value="ADMIN">Admins</option>
                <option value="WAITER">Waiters</option>
                <option value="SALES">Sales</option>
              </select>
            </div>

            {/* Activity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Activity
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="">Any time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="inactive_30">Inactive 30+ days</option>
              </select>
            </div>

            {/* Transaction Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Volume
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="">Any volume</option>
                <option value="high">High (1000+ ETB/month)</option>
                <option value="medium">Medium (100-1000 ETB/month)</option>
                <option value="low">Low (&lt;100 ETB/month)</option>
                <option value="zero">No transactions</option>
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // TODO: Apply custom filters - for now use a mock count
              onSelect({
                id: 'CUSTOM_FILTER',
                name: 'Custom Audience',
                count: 0, // Will be calculated when custom filters are implemented
                criteria: { segment: 'CUSTOM_FILTER' }
              });
            }}
          >
            Apply Custom Filters
          </Button>
        </div>
      )}

      {/* Selected Audience Preview */}
      {selected && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300">
                {selected.name}
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {selected.count.toLocaleString()} recipients selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/communications/audience?segment=${selected.id}`)}
              className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/30"
            >
              Preview Recipients
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelect(null)}
              className="text-gray-600 dark:text-gray-400"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
