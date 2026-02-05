"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { BellIcon, MailIcon, TimeIcon } from "@/icons";

interface MerchantApprovalStatusProps {
  className?: string;
}

export default function MerchantApprovalStatus({ className = "" }: MerchantApprovalStatusProps) {
  const [contactEmail, setContactEmail] = useState<string>("");

  useEffect(() => {
    // Get contact email from environment variables
    setContactEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL || "fetanpay@gmail.com");
  }, []);

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Merchant Account Approval - Support Request");
    const body = encodeURIComponent(
      "Hello FetanPay Support Team,\n\n" +
      "I am writing to inquire about the status of my merchant account approval. " +
      "My account has been pending approval for more than 1 hour.\n\n" +
      "Please let me know if you need any additional information or documentation.\n\n" +
      "Thank you for your assistance.\n\n" +
      "Best regards"
    );
    
    window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full">
        {/* Main Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <TimeIcon className="  text-orange-600 dark:text-orange-400" />
              </div>
              {/* Animated pulse ring */}
              <div className="absolute inset-0 w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Status Title */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Account Under Review
          </h1>

          {/* Status Message */}
          <div className="space-y-4 mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Your merchant account is currently being reviewed by our admin team.
            </p>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <BellIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-orange-800 dark:text-orange-200 font-medium mb-2">
                    Expected Processing Time
                  </p>
                  <p className="text-orange-700 dark:text-orange-300 text-sm leading-relaxed">
                    Account approval typically takes up to <strong>1 hour</strong>. 
                    You'll receive an email notification once your account is approved and ready to use.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              What happens next?
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">1</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our admin team will review your merchant account details
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">2</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  You'll receive an email confirmation once approved
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">3</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Full access to all merchant features will be enabled
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MailIcon className=" text-gray-500 dark:text-gray-400" />
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Need help or approval taking longer than expected?
              </p>
            </div>
            
            <Button
              onClick={handleContactSupport}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Customer Service
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Email: {contactEmail}
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        {/* <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                Why do we review accounts?
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                We review all merchant accounts to ensure security, compliance, and the best experience for both merchants and customers. 
                This helps us maintain the highest standards of service and protect all users on our platform.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}