"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";
import { EnvelopeIcon, ChatIcon, UserIcon, EyeIcon, PaperPlaneIcon } from "@/icons";
import AudienceSelector from "./AudienceSelector";
import MessagePreview from "./MessagePreview";
import { useSendEmailMutation, useListEmailTemplatesQuery } from "@/lib/services/communicationsApi";

type MessageType = 'email' | 'sms';

interface MessageData {
  type: MessageType;
  subject: string;
  content: string;
  targetAudience: any;
}

export default function MessageComposer() {
  const [messageType, setMessageType] = useState<MessageType>('email');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // API hooks
  const [sendEmail, { isLoading: isSending }] = useSendEmailMutation();
  const { data: templates = [] } = useListEmailTemplatesQuery();

  const characterCount = content.length;
  const smsLimit = 160;
  const smsSegments = Math.ceil(characterCount / smsLimit);

  const handleSend = async () => {
    if (!isReadyToSend) return;

    try {
      if (messageType === 'email') {
        // Get a real recipient from the audience preview
        if (!targetAudience?.preview || targetAudience.preview.length === 0) {
          alert('No recipients found for the selected audience. Please select a different audience.');
          return;
        }

        const recipientEmail = targetAudience.preview[0].email;
        
        await sendEmail({
          toEmail: recipientEmail,
          subject,
          content,
          templateId: selectedTemplate || undefined,
          variables: {
            merchantName: targetAudience.preview[0].name || 'Merchant',
            loginUrl: 'https://admin.fetanpay.et',
            supportEmail: 'support@fetanpay.et',
            supportPhone: '+251911000000',
          },
        }).unwrap();

        // Show success message
        alert(`Email sent successfully to ${recipientEmail}!`);
        
        // Reset form
        setSubject('');
        setContent('');
        setTargetAudience(null);
        setSelectedTemplate('');
      } else {
        // SMS sending would be implemented here
        alert('SMS sending not yet implemented');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setContent(template.content);
    }
  };

  const isReadyToSend = content.trim() && targetAudience && (messageType === 'sms' || subject.trim());

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Type Selector */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Message Type
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setMessageType('email')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  messageType === 'email'
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <EnvelopeIcon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-xs opacity-75">Rich content, attachments</div>
                </div>
              </button>
              
              <button
                onClick={() => setMessageType('sms')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  messageType === 'sms'
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <ChatIcon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">SMS</div>
                  <div className="text-xs opacity-75">Quick, direct messaging</div>
                </div>
              </button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Target Audience
              </h3>
            </div>
            <AudienceSelector 
              onSelect={setTargetAudience}
              selected={targetAudience}
            />
          </div>

          {/* Template Selector (only for email) */}
          {messageType === 'email' && (
            <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Email Template (Optional)
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose a template to start with
                </label>
                <select
                  value={selectedTemplate}
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
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Message Content
            </h3>
            
            {/* Email Subject (only for email) */}
            {messageType === 'email' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Message Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {messageType === 'email' ? 'Email Content' : 'SMS Message'}
                </label>
                {messageType === 'sms' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {characterCount}/{smsLimit} chars
                    {smsSegments > 1 && (
                      <span className="ml-2 text-orange-600 dark:text-orange-400">
                        ({smsSegments} segments)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  messageType === 'email' 
                    ? "Write your email content here...\n\nYou can use variables like {{merchantName}}, {{status}}, etc."
                    : "Write your SMS message here...\n\nKeep it short and clear. You can use {{merchantName}}, {{amount}}, etc."
                }
                rows={messageType === 'email' ? 12 : 6}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  messageType === 'sms' && characterCount > smsLimit
                    ? "border-orange-400 dark:border-orange-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              
              {messageType === 'sms' && characterCount > smsLimit && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  ⚠️ Message will be split into {smsSegments} segments (higher cost)
                </p>
              )}
            </div>

            {/* Variable Helper */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Available Variables:
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  '{{merchantName}}',
                  '{{userEmail}}', 
                  '{{status}}',
                  '{{amount}}',
                  '{{date}}',
                  '{{loginUrl}}'
                ].map((variable) => (
                  <button
                    key={variable}
                    onClick={() => setContent(content + variable)}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <EyeIcon className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
              
              <Button variant="outline">
                Save as Template
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline">
                Save Draft
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={!isReadyToSend || isSending}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
              >
                <PaperPlaneIcon className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Now'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Preview & Settings */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Message Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className={`font-medium ${
                  messageType === 'email' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {messageType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {targetAudience?.count || 0}
                </span>
              </div>
              {messageType === 'sms' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Segments:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {smsSegments}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Est. Cost:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {messageType === 'email' 
                    ? 'Free' 
                    : `${((targetAudience?.count || 0) * smsSegments * 0.25).toFixed(2)} ETB`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <MessagePreview
              type={messageType}
              subject={subject}
              content={content}
              sampleData={{
                merchantName: targetAudience?.preview?.[0]?.name || "Sample Merchant",
                userEmail: targetAudience?.preview?.[0]?.email || "recipient@example.com",
                status: "APPROVED",
                amount: "1,250.00",
                date: new Date().toLocaleDateString(),
                loginUrl: "https://admin.fetanpay.et/login"
              }}
            />
          )}

          {/* Send Options */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Send Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="sendTime" value="now" defaultChecked />
                <span className="text-sm text-gray-700 dark:text-gray-300">Send immediately</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sendTime" value="scheduled" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Schedule for later</span>
              </label>
              <div className="ml-6 space-y-2">
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

         
        </div>

        
      </div>
    </div>
  );
}
