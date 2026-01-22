"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  useCreateCampaignMutation, 
  useListEmailTemplatesQuery, 
  useGetAudienceCountMutation,
  AudienceSegmentType,
  CampaignType 
} from "@/lib/services/communicationsApi";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, UserIcon, EyeIcon } from "@/icons";

const AUDIENCE_SEGMENTS = [
  { id: 'ALL_MERCHANTS', name: 'All Merchants', description: 'Every merchant in the system', icon: '🏪' },
  { id: 'PENDING_MERCHANTS', name: 'Pending Approval', description: 'Merchants awaiting admin approval', icon: '⏳' },
  { id: 'ACTIVE_MERCHANTS', name: 'Active Merchants', description: 'Approved and active merchants', icon: '✅' },
  { id: 'BANNED_USERS', name: 'Banned Users', description: 'Users who have been banned', icon: '🚫' },
  { id: 'INACTIVE_MERCHANTS', name: 'Inactive Merchants', description: 'No login in last 30 days', icon: '😴' },
  { id: 'HIGH_VOLUME_MERCHANTS', name: 'High Volume Merchants', description: '1000+ ETB transactions last month', icon: '💰' },
  { id: 'NEW_SIGNUPS', name: 'New Signups', description: 'Registered in last 7 days', icon: '🆕' },
  { id: 'MERCHANT_OWNERS', name: 'Merchant Owners', description: 'Business owners only', icon: '👔' },
  { id: 'WAITERS', name: 'Waiters', description: 'Restaurant/cafe staff', icon: '🍽️' },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMAIL' as CampaignType,
    subject: '',
    content: '',
    templateId: '',
    audienceSegment: 'ACTIVE_MERCHANTS' as AudienceSegmentType,
    scheduledAt: '',
  });
  
  const [audienceCount, setAudienceCount] = useState<number>(0);

  const { data: templates = [] } = useListEmailTemplatesQuery();
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [getAudienceCount] = useGetAudienceCountMutation();

  // Get audience count when segment changes
  useEffect(() => {
    const fetchAudienceCount = async () => {
      try {
        const result = await getAudienceCount({
          segment: formData.audienceSegment,
        }).unwrap();
        setAudienceCount(result.count);
      } catch (error) {
        console.error('Failed to get audience count:', error);
      }
    };

    fetchAudienceCount();
  }, [formData.audienceSegment, getAudienceCount]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        subject: template.subject,
        content: template.content,
      }));
    }
  };

  const handlePreviewAudience = async () => {
    // Redirect to the audience preview page
    router.push(`/communications/audience?segment=${formData.audienceSegment}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if ((formData.type === 'EMAIL' || formData.type === 'BOTH') && !formData.subject.trim()) {
      alert('Email subject is required for email campaigns');
      return;
    }

    try {
      const campaign = await createCampaign({
        name: formData.name,
        type: formData.type,
        subject: formData.subject || undefined,
        content: formData.content,
        templateId: formData.templateId || undefined,
        audienceSegment: formData.audienceSegment,
        scheduledAt: formData.scheduledAt || undefined,
        variables: {
          loginUrl: 'https://admin.fetanpay.et',
          supportEmail: 'support@fetanpay.et',
          supportPhone: '+251911000000',
        },
      }).unwrap();

      alert('Campaign created successfully!');
      router.push('/communications/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const selectedSegment = AUDIENCE_SEGMENTS.find(s => s.id === formData.audienceSegment);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/communications/campaigns"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Campaigns
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Campaign
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a bulk email campaign to reach your target audience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Campaign Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Welcome New Merchants - Q1 2026"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CampaignType }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="BOTH">Both Email & SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to save as draft
                  </p>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            {(formData.type === 'EMAIL' || formData.type === 'BOTH') && (
              <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Email Template (Optional)
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose a template to start with
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Message Content
              </h3>
              
              <div className="space-y-4">
                {(formData.type === 'EMAIL' || formData.type === 'BOTH') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.type === 'EMAIL' || formData.type === 'BOTH'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your message content here..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Variable Helper */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Available Variables:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '{{merchantName}}',
                      '{{merchantEmail}}',
                      '{{merchantBusinessName}}',
                      '{{userRole}}',
                      '{{loginUrl}}',
                      '{{supportEmail}}',
                      '{{supportPhone}}'
                    ].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + variable }))}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Audience Selection */}
            <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Target Audience
              </h3>
              
              <div className="space-y-3">
                {AUDIENCE_SEGMENTS.map((segment) => (
                  <label key={segment.id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="audienceSegment"
                      value={segment.id}
                      checked={formData.audienceSegment === segment.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, audienceSegment: e.target.value as AudienceSegmentType }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{segment.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {segment.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {segment.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedSegment && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedSegment.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {audienceCount.toLocaleString()} recipients
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewAudience}
                      className="flex items-center gap-1"
                    >
                      <EyeIcon className="w-3 h-3" />
                      Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isCreating ? 'Creating...' : 'Create Campaign'}
                </Button>
                
                <Link href="/communications/campaigns">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}