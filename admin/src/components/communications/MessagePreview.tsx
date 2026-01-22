"use client";
import React from "react";

interface MessagePreviewProps {
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  sampleData: Record<string, string>;
}

export default function MessagePreview({ type, subject, content, sampleData }: MessagePreviewProps) {
  // Replace template variables with sample data
  const processContent = (text: string) => {
    let processed = text;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });
    return processed;
  };

  // Convert HTML to plain text for SMS
  const htmlToPlainText = (html: string) => {
    // Create a temporary div element to parse HTML
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
    
    // Get text content and clean up whitespace
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

  const processedSubject = subject ? processContent(subject) : '';
  const processedContent = processContent(content);
  
  // For SMS, convert HTML to plain text if needed
  const smsContent = type === 'sms' ? htmlToPlainText(processedContent) : processedContent;

  if (type === 'email') {
    return (
      <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            📧 Email Preview
          </h3>
        </div>
        
        <div className="p-4">
          {/* Email Header */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">From:</span>
              <span className="text-gray-900 dark:text-white">FetanPay &lt;noreply@fetanpay.et&gt;</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">To:</span>
              <span className="text-gray-900 dark:text-white">{sampleData.userEmail || 'recipient@example.com'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subject:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {processedSubject || 'No subject'}
              </span>
            </div>
          </div>

          {/* Email Body */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[200px]">
            <div 
              className="text-gray-900 dark:text-white prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ 
                __html: processedContent || '<p style="color: #6b7280; font-style: italic;">Email content will appear here...</p>' 
              }}
            />
          </div>

          {/* Email Footer */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              This email was sent by FetanPay. If you no longer wish to receive these emails, 
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline"> unsubscribe here</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SMS Preview
  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          📱 SMS Preview
        </h3>
      </div>
      
      <div className="p-4">
        {/* Phone Mockup */}
        <div className="max-w-sm mx-auto">
          <div className="bg-gray-900 rounded-3xl p-2 shadow-xl">
            <div className="bg-white dark:bg-gray-100 rounded-2xl overflow-hidden">
              {/* Phone Header */}
              <div className="bg-gray-100 dark:bg-gray-200 px-4 py-2 text-center">
                <div className="text-xs text-gray-600 font-medium">FetanPay</div>
                <div className="text-xs text-gray-500">now</div>
              </div>
              
              {/* SMS Content */}
              <div className="p-4 min-h-[120px]">
                <div className="bg-green-500 text-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] ml-auto">
                  <div 
                    className="text-sm leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {smsContent || 'SMS message will appear here...'}
                  </div>
                </div>
                
                {/* Character count indicator */}
                <div className="mt-2 text-right">
                  <span className={`text-xs ${
                    smsContent.length > 160 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {smsContent.length}/160 chars
                    {smsContent.length > 160 && (
                      <span className="ml-1">
                        ({Math.ceil(smsContent.length / 160)} segments)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Footer */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            SMS will be sent from: <span className="font-medium">FetanPay</span>
            <br />
            Recipients can reply STOP to unsubscribe
          </p>
        </div>
      </div>
    </div>
  );
}
