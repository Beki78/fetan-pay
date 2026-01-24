"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";
import { PlusIcon, PencilIcon, TrashBinIcon, EyeIcon, CopyIcon } from "@/icons";

interface MessageTemplate {
  id: string;
  name: string;
  category: 'WELCOME' | 'APPROVAL' | 'SECURITY' | 'MARKETING' | 'REMINDER';
  type: 'EMAIL' | 'SMS';
  subject?: string;
  content: string;
  variables: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock templates - replace with API calls later
const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Merchant',
    category: 'WELCOME',
    type: 'EMAIL',
    subject: 'Welcome to FetanPay! Your journey starts here 🚀',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to FetanPay!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your payment journey starts here</p>
      </div>
      
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 22px;">Hello {{merchantName}}! 👋</h2>
        
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
          Congratulations! Your merchant account has been approved and is now active. You're ready to start accepting payments and growing your business.
        </p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #5CFFCE;">
          <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">What's next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">🏦 Set up your payment accounts</li>
            <li style="margin-bottom: 8px;">🎨 Configure your branding</li>
            <li style="margin-bottom: 8px;">👥 Add team members</li>
            <li style="margin-bottom: 8px;">💳 Start accepting payments</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            Access Your Dashboard
          </a>
        </div>
      </div>
    </div>`,
    variables: ['merchantName', 'loginUrl', 'supportEmail'],
    usageCount: 156,
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Account Approved SMS',
    category: 'APPROVAL',
    type: 'SMS',
    content: '🎉 Great news {{merchantName}}! Your FetanPay account is approved. Login: {{loginUrl}} Need help? Reply HELP',
    variables: ['merchantName', 'loginUrl'],
    usageCount: 89,
    isActive: true,
    createdAt: '2026-01-12T09:15:00Z',
    updatedAt: '2026-01-12T09:15:00Z'
  },
  {
    id: '3',
    name: 'Security Alert Email',
    category: 'SECURITY',
    type: 'EMAIL',
    subject: '🔒 Security Alert: {{alertType}} detected',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
      <div style="background: #ef4444; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🔒 Security Alert</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="margin: 0 0 20px 0; font-size: 16px;">Hello {{merchantName}},</p>
        
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
          We detected {{alertType}} on your FetanPay account:
        </p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li><strong>Time:</strong> {{alertTime}}</li>
            <li><strong>Location:</strong> {{alertLocation}}</li>
            <li><strong>Device:</strong> {{alertDevice}}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="{{secureUrl}}" style="background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Secure My Account
          </a>
        </div>
      </div>
    </div>`,
    variables: ['merchantName', 'alertType', 'alertTime', 'alertLocation', 'alertDevice', 'secureUrl'],
    usageCount: 12,
    isActive: true,
    createdAt: '2026-01-08T16:20:00Z',
    updatedAt: '2026-01-16T11:45:00Z'
  },
  {
    id: '4',
    name: 'Payment Reminder SMS',
    category: 'REMINDER',
    type: 'SMS',
    content: '💰 Hi {{merchantName}}, you have {{amount}} ETB pending in your wallet. Withdraw now: {{withdrawUrl}}',
    variables: ['merchantName', 'amount', 'withdrawUrl'],
    usageCount: 234,
    isActive: true,
    createdAt: '2026-01-05T13:10:00Z',
    updatedAt: '2026-01-17T09:20:00Z'
  },
  {
    id: '5',
    name: 'Feature Announcement',
    category: 'MARKETING',
    type: 'EMAIL',
    subject: '🆕 Introducing {{featureName}} - Now Available!',
    content: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🆕 New Feature Available!</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 22px;">Hello {{merchantName}}!</h2>
        
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
          We're excited to announce <strong>{{featureName}}</strong> is now available!
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
          {{featureDescription}}
        </p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #5CFFCE;">
          <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">Key benefits:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">{{benefit1}}</li>
            <li style="margin-bottom: 8px;">{{benefit2}}</li>
            <li style="margin-bottom: 8px;">{{benefit3}}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{featureUrl}}" style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            Get Started
          </a>
        </div>
      </div>
    </div>`,
    variables: ['merchantName', 'featureName', 'featureDescription', 'benefit1', 'benefit2', 'benefit3', 'featureUrl', 'supportEmail'],
    usageCount: 0,
    isActive: false,
    createdAt: '2026-01-18T12:00:00Z',
    updatedAt: '2026-01-18T12:00:00Z'
  }
];

const getCategoryColor = (category: MessageTemplate['category']) => {
  switch (category) {
    case 'WELCOME':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'APPROVAL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'SECURITY':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'MARKETING':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'REMINDER':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getTypeIcon = (type: MessageTemplate['type']) => {
  return type === 'EMAIL' ? '📧' : '📱';
};

export default function TemplateLibrary() {
  const [templates] = useState<MessageTemplate[]>(MOCK_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const categories = ['ALL', 'WELCOME', 'APPROVAL', 'SECURITY', 'MARKETING', 'REMINDER'];
  const types = ['ALL', 'EMAIL', 'SMS'];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'ALL' || template.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || template.type === selectedType;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Template Library
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage reusable message templates
          </p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'ALL' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'ALL' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(template.type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <TrashBinIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Content Preview */}
            <div className="mb-4">
              {template.subject && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {template.subject}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Content:</p>
                {template.type === 'EMAIL' ? (
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: template.content.length > 150 
                        ? template.content.substring(0, 150) + '...' 
                        : template.content 
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {template.content}
                  </p>
                )}
              </div>
            </div>

            {/* Template Variables */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.slice(0, 3).map((variable) => (
                  <span
                    key={variable}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded"
                  >
                    {`{{${variable}}}`}
                  </span>
                ))}
                {template.variables.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    +{template.variables.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Template Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span>Used {template.usageCount} times</span>
              <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Use Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-gray-600 dark:text-gray-400"
              >
                <CopyIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Active Status Indicator */}
            {!template.isActive && (
              <div className="mt-2 text-center">
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  ⚠️ Template is inactive
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory !== 'ALL' || selectedType !== 'ALL'
              ? 'Try adjusting your filters or search term.'
              : 'Create your first message template to get started.'}
          </p>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Template Details
              </h3>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-600 dark:text-gray-400"
              >
                Close
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTemplate.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(selectedTemplate.type)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedTemplate.type}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedTemplate.category)}`}>
                    {selectedTemplate.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Usage Count</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTemplate.usageCount} times
                  </p>
                </div>
              </div>

              {/* Subject */}
              {selectedTemplate.subject && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subject</p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white">
                      {selectedTemplate.subject}
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Content</p>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {selectedTemplate.type === 'EMAIL' ? (
                    <div 
                      className="text-sm text-gray-900 dark:text-white prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                    />
                  ) : (
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedTemplate.content}
                    </pre>
                  )}
                </div>
              </div>

              {/* Variables */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Available Variables ({selectedTemplate.variables.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 flex-1">
                  Use This Template
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <CopyIcon className="w-4 h-4" />
                  Duplicate
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
