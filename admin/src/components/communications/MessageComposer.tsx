"use client";
import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import { EnvelopeIcon, ChatIcon, UserIcon, EyeIcon, PaperPlaneIcon } from "@/icons";
import AudienceSelector from "./AudienceSelector";
import MessagePreview from "./MessagePreview";
import { useSendEmailMutation, useSendSmsMutation, useListEmailTemplatesQuery } from "@/lib/services/communicationsApi";
import { toast } from "sonner";

type MessageType = 'email' | 'sms';

export default function MessageComposer() {
  const [messageType, setMessageType] = useState<MessageType>('email');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'unsaved'>('unsaved');
  
  // API hooks
  const [sendEmail, { isLoading: isSendingEmail }] = useSendEmailMutation();
  const [sendSms, { isLoading: isSendingSms }] = useSendSmsMutation();
  const { data: templates = [] } = useListEmailTemplatesQuery();

  const isSending = isSendingEmail || isSendingSms;

  // Handle message type switching with validation
  const handleMessageTypeChange = (newType: MessageType) => {
    if (newType === messageType) return;

    // If switching from email to SMS and there's HTML content, warn user
    if (newType === 'sms' && messageType === 'email' && content.includes('<')) {
      toast.info('📱 Switched to SMS - HTML content will be converted to plain text');
    }

    // If switching to SMS and content is too long, warn user
    if (newType === 'sms' && content.length > 160) {
      const segments = Math.ceil(content.length / 160);
      toast.warning(`⚠️ SMS mode: Message is ${content.length} characters and will be split into ${segments} segments`);
    }

    // If switching from SMS to Email, inform about rich content availability
    if (newType === 'email' && messageType === 'sms') {
      toast.info('📧 Switched to Email - You can now use rich HTML formatting');
    }

    setMessageType(newType);
    setDraftStatus('unsaved');
  };

  // Allow sending as long as there's some basic content - validation will be in handleSend
  const isReadyToSend = !isSending;

  // Remove the validation message display - we'll handle everything in toast
  const validationMessage = null;

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('messageComposerDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setMessageType(draft.messageType || 'email');
        setSubject(draft.subject || '');
        setContent(draft.content || '');
        setSelectedTemplate(draft.selectedTemplate || '');
        // Note: targetAudience is not saved to avoid stale data
        
        // Show a toast to indicate draft was loaded
        if (draft.content || draft.subject) {
          toast.info('📄 Draft loaded from previous session');
        }
      } catch (error: any) {
        console.error('Failed to load draft:', error);
        toast.error('❌ Failed to load saved draft');
        // Clear corrupted draft
        localStorage.removeItem('messageComposerDraft');
      }
    }
  }, []);

  // Auto-save draft as user types (debounced)
  useEffect(() => {
    if (!content.trim() && !subject.trim()) {
      setDraftStatus('unsaved');
      return;
    }
    
    setDraftStatus('saving');
    
    const timeoutId = setTimeout(() => {
      try {
        const draft = {
          messageType,
          subject,
          content,
          selectedTemplate,
          savedAt: new Date().toISOString(),
        };
        
        localStorage.setItem('messageComposerDraft', JSON.stringify(draft));
        setDraftStatus('saved');
      } catch (error: any) {
        console.error('Failed to auto-save draft:', error);
        setDraftStatus('unsaved');
        // Don't show toast for auto-save failures to avoid spam
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [messageType, subject, content, selectedTemplate]);

  // Convert HTML to plain text for SMS character counting
  const htmlToPlainText = (html: string) => {
    if (typeof window === 'undefined') return html; // SSR safety
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Handle line breaks and paragraphs
    const paragraphs = tempDiv.querySelectorAll('p, div, br');
    paragraphs.forEach(p => {
      if (p.tagName === 'BR') {
        p.replaceWith('\n');
      } else if (p.tagName === 'P' || p.tagName === 'DIV') {
        p.insertAdjacentText('afterend', '\n');
      }
    });
    
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up whitespace but preserve intentional line breaks
    text = text.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
    text = text.replace(/\n\s+/g, '\n'); // Remove spaces after newlines
    text = text.replace(/\s+\n/g, '\n'); // Remove spaces before newlines
    text = text.replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with max 2
    text = text.trim();
    
    // Convert common HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    return text;
  };

  const characterCount = messageType === 'sms' ? htmlToPlainText(content).length : content.length;
  const smsLimit = 160;
  const smsSegments = Math.ceil(characterCount / smsLimit);

  const handleSend = async () => {
    // Comprehensive validation with helpful toast messages
    if (!content.trim()) {
      toast.error(messageType === 'email' ? 
        '📝 Please enter email content before sending' : 
        '📱 Please enter SMS message before sending'
      );
      return;
    }

    if (messageType === 'email' && !subject.trim()) {
      toast.error('📧 Please enter an email subject line');
      return;
    }

    if (!targetAudience) {
      toast.error('👥 Please select a target audience for your message');
      return;
    }

    if (!targetAudience?.preview || targetAudience.preview.length === 0) {
      toast.error('❌ No recipients found in the selected audience. Please choose a different audience segment.');
      return;
    }

    // SMS-specific validation
    if (messageType === 'sms') {
      const recipientsWithPhone = targetAudience.preview.filter((r: any) => r.phone);
      
      if (recipientsWithPhone.length === 0) {
        toast.error('📞 No phone numbers found in the selected audience. Please ensure the audience has users with phone numbers.');
        return;
      }

      // Warn about SMS length
      const plainTextContent = htmlToPlainText(content);
      if (plainTextContent.length > 160) {
        const segments = Math.ceil(plainTextContent.length / 160);
        toast.warning(`⚠️ Your SMS is ${plainTextContent.length} characters and will be split into ${segments} segments (higher cost)`);
      }
    }

    try {
      if (messageType === 'email') {
        const recipientEmail = targetAudience.preview[0].email;
        
        // Show sending toast
        toast.info('📤 Sending email...');
        
        try {
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
          toast.success(`✅ Email sent successfully to ${recipientEmail}!`);
          
          // Clear draft from localStorage on successful send
          localStorage.removeItem('messageComposerDraft');
          
          // Reset form
          setSubject('');
          setContent('');
          setTargetAudience(null);
          setSelectedTemplate('');
        } catch (emailError: any) {
          console.error('Failed to send email:', emailError);
          const errorMessage = emailError?.data?.message || emailError?.message || 'Failed to send email. Please try again.';
          toast.error(`❌ Email Error: ${errorMessage}`);
        }
      } else {
        // SMS sending
        const recipient = targetAudience.preview.find((r: any) => r.phone);
        
        // Show sending toast
        toast.info('📱 Sending SMS...');
        
        try {
          await sendSms({
            toPhone: recipient.phone,
            message: content,
            templateId: selectedTemplate || undefined,
            variables: {
              merchantName: recipient.name || 'Merchant',
              loginUrl: 'https://admin.fetanpay.et',
              supportEmail: 'support@fetanpay.et',
              supportPhone: '+251911000000',
            },
          }).unwrap();

          // Show success message
          toast.success(`✅ SMS sent successfully to ${recipient.phone}!`);
          
          // Clear draft from localStorage on successful send
          localStorage.removeItem('messageComposerDraft');
          
          // Reset form
          setSubject('');
          setContent('');
          setTargetAudience(null);
          setSelectedTemplate('');
        } catch (smsError: any) {
          console.error('Failed to send SMS:', smsError);
          const errorMessage = smsError?.data?.message || smsError?.message || 'Failed to send SMS. Please try again.';
          toast.error(`❌ SMS Error: ${errorMessage}`);
        }
      }
    } catch (generalError: any) {
      console.error(`General error in handleSend:`, generalError);
      toast.error('❌ An unexpected error occurred. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    // Allow saving even empty drafts - just inform the user
    if (!content.trim() && !subject.trim()) {
      toast.info('💾 Saving empty draft - you can continue editing later');
    }

    setIsSavingDraft(true);
    
    try {
      const draft = {
        messageType,
        subject,
        content,
        selectedTemplate,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('messageComposerDraft', JSON.stringify(draft));
      toast.success('💾 Draft saved successfully!');
      setDraftStatus('saved');
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      toast.error('❌ Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    try {
      if (!templateId) {
        // User selected "Select a template..." option
        setSelectedTemplate('');
        return;
      }

      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(templateId);
        setSubject(template.subject);
        
        // For SMS, convert HTML content to plain text
        if (messageType === 'sms') {
          const plainTextContent = htmlToPlainText(template.content);
          setContent(plainTextContent);
          toast.success(`📱 Template "${template.name}" loaded and converted to plain text for SMS`);
        } else {
          setContent(template.content);
          toast.success(`📧 Template "${template.name}" loaded successfully`);
        }
        
        setDraftStatus('unsaved');
      } else {
        toast.error('❌ Template not found');
      }
    } catch (error: any) {
      console.error('Failed to load template:', error);
      toast.error('❌ Failed to load template. Please try again.');
    }
  };

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
                onClick={() => handleMessageTypeChange('email')}
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
                onClick={() => handleMessageTypeChange('sms')}
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

          {/* Template Selector */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {messageType === 'email' ? 'Email Template (Optional)' : 'Template (Optional)'}
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

          {/* SMS Template Note */}
          {messageType === 'sms' && selectedTemplate && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 dark:text-yellow-400 text-lg">ℹ️</div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                    Template Content Converted
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Email templates contain HTML formatting which will be automatically converted to plain text for SMS delivery.
                  </p>
                </div>
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
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setDraftStatus('unsaved');
                  }}
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
                onChange={(e) => {
                  setContent(e.target.value);
                  setDraftStatus('unsaved');
                }}
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
                    onClick={() => {
                      setContent(content + variable);
                      setDraftStatus('unsaved');
                    }}
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
              
              {/* Draft Status Indicator */}
              {(content.trim() || subject.trim()) && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${
                    draftStatus === 'saved' ? 'bg-green-500' : 
                    draftStatus === 'saving' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  {draftStatus === 'saved' ? 'Draft saved' : 
                   draftStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={isSending}
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
              {messageType === 'sms' && targetAudience?.preview && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">With Phone:</span>
                  <span className={`font-medium ${
                    targetAudience.preview.filter((r: any) => r.phone).length > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {targetAudience.preview.filter((r: any) => r.phone).length} / {targetAudience.preview.length}
                  </span>
                </div>
              )}
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