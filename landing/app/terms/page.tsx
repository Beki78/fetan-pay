import type { Metadata } from "next";
import Link from "next/link";
import { Navbar, Footer } from "../components";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Fetan Pay Terms of Service - Read our terms and conditions for using our bank transfer verification services.",
};

export default function TermsOfService() {
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
          Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using Fetan Pay&apos;s bank transfer verification
              services (&quot;Services&quot;), you accept and agree to be bound
              by these Terms of Service (&quot;Terms&quot;). If you do not agree
              to these Terms, you must not use our Services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you
              (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and Fetan
              Pay (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We
              reserve the right to modify these Terms at any time, and such
              modifications will be effective immediately upon posting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              2. Description of Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Fetan Pay provides instant bank transfer verification services
              across Ethiopian banks. Our Services allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Verify bank transfer transactions in real-time</li>
              <li>Confirm payment status without moving money</li>
              <li>Integrate verification APIs into your applications</li>
              <li>Access transaction history and verification records</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We support verification for multiple Ethiopian banks including
              Commercial Bank of Ethiopia (CBE), Telebirr, Awash Bank, Bank of
              Abyssinia (BOA), Dashen Bank, and other participating financial
              institutions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              3. User Accounts and Registration
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              3.1 Account Creation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use our Services, you must create an account by providing
              accurate, current, and complete information. You are responsible
              for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              3.2 Account Responsibilities
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use our Services only for lawful purposes and in
              accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>
                Violate any applicable laws, regulations, or third-party rights
              </li>
              <li>
                Attempt to gain unauthorized access to our systems or networks
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of our
                Services
              </li>
              <li>
                Use automated systems (bots, scrapers) to access our Services
                without permission
              </li>
              <li>
                Reverse engineer, decompile, or disassemble any part of our
                Services
              </li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>
                Use the Services to verify transactions you are not authorized
                to verify
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              5. Payment and Billing
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              5.1 Pricing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Services are provided on a subscription or pay-per-use basis
              as described in our pricing plans. All fees are in Ethiopian Birr
              (ETB) unless otherwise stated. We reserve the right to modify our
              pricing at any time with reasonable notice.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              5.2 Payment Terms
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Pay all fees associated with your use of the Services</li>
              <li>Provide valid payment information</li>
              <li>Authorize us to charge your payment method</li>
              <li>Pay any applicable taxes</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              5.3 Refunds
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Refund policies are determined on a case-by-case basis. Generally,
              fees for completed verification transactions are non-refundable.
              Subscription fees may be refunded on a prorated basis if you
              cancel within the refund period specified in your plan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              6. API Usage and Integration
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you integrate our API into your applications:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                You must comply with our API documentation and usage guidelines
              </li>
              <li>
                You are responsible for securing your API keys and credentials
              </li>
              <li>
                You must not exceed the rate limits specified in your plan
              </li>
              <li>
                You must implement appropriate error handling and security
                measures
              </li>
              <li>
                We reserve the right to suspend or terminate API access for
                violations
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              7. Service Availability and Modifications
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to provide reliable Services but do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Uninterrupted or error-free service</li>
              <li>100% accuracy of verification results</li>
              <li>Availability of all bank integrations at all times</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Modify, suspend, or discontinue any part of our Services</li>
              <li>Perform maintenance and updates</li>
              <li>Change features or functionality</li>
              <li>
                Limit access to Services for maintenance or security reasons
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content, features, and functionality of our Services,
              including but not limited to software, text, graphics, logos, and
              API documentation, are owned by Fetan Pay or its licensors and are
              protected by copyright, trademark, and other intellectual property
              laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable license
              to use our Services in accordance with these Terms. You may not
              copy, modify, distribute, sell, or lease any part of our Services
              without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              9. Disclaimers and Limitations of Liability
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              9.1 Service Disclaimer
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              9.2 Limitation of Liability
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FETAN PAY SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
              DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF OUR
              SERVICES.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claims arising from these Terms or the
              Services shall not exceed the amount you paid to us in the twelve
              (12) months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              10. Indemnification
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Fetan Pay, its
              officers, directors, employees, and agents from any claims,
              damages, losses, liabilities, and expenses (including legal fees)
              arising from your use of the Services, violation of these Terms,
              or infringement of any rights of another party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              11. Termination
            </h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              11.1 Termination by You
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may terminate your account at any time by contacting us or
              using the account cancellation features in your dashboard.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              11.2 Termination by Us
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your account immediately if:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You violate these Terms</li>
              <li>You engage in fraudulent or illegal activities</li>
              <li>You fail to pay required fees</li>
              <li>We are required to do so by law</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">
              11.3 Effect of Termination
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your right to use the Services will immediately
              cease. We may delete your account data in accordance with our data
              retention policies. Provisions of these Terms that by their nature
              should survive termination will remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              12. Governing Law and Dispute Resolution
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with
              the laws of Ethiopia, without regard to its conflict of law
              provisions.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these Terms or the Services shall be
              resolved through good faith negotiation. If negotiation fails,
              disputes shall be submitted to the exclusive jurisdiction of the
              courts of Ethiopia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify you of material changes by posting the updated Terms on our
              website and updating the &quot;Last Updated&quot; date. Your
              continued use of the Services after such modifications constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              14. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Fetan Pay</strong>
              </p>
              <p className="text-gray-700 mb-2">Email: legal@fetanpay.com</p>
              <p className="text-gray-700 mb-2">
                Support: support@fetanpay.com
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

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#174686] mb-4">
              15. Miscellaneous
            </h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Entire Agreement:</strong> These Terms constitute the
                entire agreement between you and Fetan Pay regarding the
                Services.
              </li>
              <li>
                <strong>Severability:</strong> If any provision of these Terms
                is found to be unenforceable, the remaining provisions will
                remain in full effect.
              </li>
              <li>
                <strong>Waiver:</strong> Our failure to enforce any provision
                does not constitute a waiver of that provision.
              </li>
              <li>
                <strong>Assignment:</strong> You may not assign these Terms
                without our prior written consent. We may assign these Terms at
                any time.
              </li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
