import type { Metadata } from "next";
import Link from "next/link";
import { Navbar, Footer } from "../components";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Fetan Pay Privacy Policy - Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#174686] hover:opacity-80 transition-opacity"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            ← Back to Home
          </Link>
        </div>

        <h1
          className="text-4xl font-bold text-[#174686] mb-8"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          Privacy Policy
        </h1>

        <div
          className="prose prose-lg max-w-none"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Fetan Pay. We are committed to protecting your privacy
              and ensuring the security of your personal information. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our bank transfer
              verification services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Fetan Pay, you agree to the collection and use of
              information in accordance with this policy. If you do not agree
              with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              2.1 Personal Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect personal information that you provide directly to
              us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                Name and contact information (email address, phone number)
              </li>
              <li>Business information (company name, business type)</li>
              <li>Payment and billing information</li>
              <li>Account credentials and authentication information</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              2.2 Transaction Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you use our verification services, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Transaction reference numbers</li>
              <li>Bank account information (for verification purposes only)</li>
              <li>Transaction amounts and timestamps</li>
              <li>Verification status and results</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              2.3 Technical Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We automatically collect certain technical information when you
              access our services:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Service Delivery:</strong> To provide, maintain, and
                improve our bank transfer verification services
              </li>
              <li>
                <strong>Authentication:</strong> To verify your identity and
                authenticate transactions
              </li>
              <li>
                <strong>Communication:</strong> To send you service updates,
                notifications, and respond to your inquiries
              </li>
              <li>
                <strong>Security:</strong> To detect, prevent, and address
                technical issues, fraud, and security threats
              </li>
              <li>
                <strong>Analytics:</strong> To analyze usage patterns and
                improve our services
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable
                laws, regulations, and legal processes
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                service providers who assist us in operating our services
              </li>
              <li>
                <strong>Bank Partners:</strong> With partner banks and financial
                institutions necessary for verification services
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court
                order, or government regulation
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
              <li>
                <strong>With Your Consent:</strong> When you have explicitly
                authorized us to share your information
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your
              personal information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and assessments</li>
              <li>Employee training on data protection</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the internet or electronic
              storage is 100% secure. While we strive to protect your
              information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain business records as required by law</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              When information is no longer needed, we will securely delete or
              anonymize it in accordance with our data retention policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Access:</strong> Request access to your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data
              </li>
              <li>
                <strong>Opt-out:</strong> Opt-out of certain data processing
                activities
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise these rights, please contact us using the information
              provided in the Contact section below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your
              experience, analyze usage, and assist with marketing efforts. You
              can control cookies through your browser settings, but this may
              affect the functionality of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you believe we have collected information from a child, please
              contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. We ensure appropriate
              safeguards are in place to protect your information in accordance
              with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new Privacy
              Policy on this page and updating the &quot;Last Updated&quot;
              date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Fetan Pay</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Email:{" "}
                <Link
                  href="mailto:fetanpay@gmail.com"
                  className="text-[#174686] hover:underline"
                >
                  fetanpay@gmail.com
                </Link>
              </p>
              <p className="text-gray-700">
                Website:{" "}
                <Link
                  href="https://fetanpay.com"
                  className="text-[#174686] hover:underline"
                >
                  https://fetanpay.com
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
