import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Terms and Conditions | FetanPay",
  description: "Terms and Conditions for FetanPay merchant services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/signup"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6"
          >
            <ChevronLeftIcon />
            Back to Sign Up
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: February 5, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By creating an account and using FetanPay services, you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Service Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              FetanPay provides payment processing services for merchants in Ethiopia, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Payment gateway integration</li>
              <li>Transaction processing and verification</li>
              <li>Merchant dashboard and analytics</li>
              <li>API access for developers</li>
              <li>Customer support services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Account Registration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              To use our services, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be at least 18 years old or have legal capacity to enter contracts</li>
              <li>Operate a legitimate business in Ethiopia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Merchant Obligations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              As a merchant using FetanPay, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Comply with all applicable laws and regulations</li>
              <li>Provide clear product/service descriptions to customers</li>
              <li>Honor refund and return policies</li>
              <li>Maintain accurate transaction records</li>
              <li>Not engage in fraudulent or illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Fees and Payments
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Transaction fees and service charges are outlined in your merchant agreement. 
              Fees may be updated with 30 days notice. All fees are non-refundable unless 
              otherwise specified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Data Protection
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We are committed to protecting your data in accordance with applicable data 
              protection laws. Please refer to our Privacy Policy for detailed information 
              about how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              FetanPay shall not be liable for any indirect, incidental, special, or 
              consequential damages arising from your use of our services. Our total 
              liability shall not exceed the fees paid by you in the 12 months preceding 
              the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Either party may terminate this agreement with 30 days written notice. 
              We may suspend or terminate your account immediately for violations of 
              these terms or suspected fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These terms are governed by the laws of Ethiopia. Any disputes shall be 
              resolved in the courts of Addis Ababa, Ethiopia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                Email: legal@fetanpay.com<br />
                Phone: +251 11 XXX XXXX<br />
                Address: Addis Ababa, Ethiopia
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}