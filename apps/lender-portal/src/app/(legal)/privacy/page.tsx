import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | 1099Pass',
  description: 'Privacy Policy for 1099Pass - how we collect, use, and protect your data',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-foreground">
          Privacy Policy
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Effective Date: February 1, 2025
          <br />
          Last Updated: February 1, 2025
        </p>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              1099Pass, Inc. (&quot;1099Pass,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use
              our platform and services.
            </p>
            <p>
              Please read this Privacy Policy carefully. By using our Service, you
              consent to the collection and use of your information as described
              herein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address, phone
                number, password, and profile details
              </li>
              <li>
                <strong>Identity Verification:</strong> Date of birth, Social
                Security Number (last 4 digits), address, and government ID
                information for KYC purposes
              </li>
              <li>
                <strong>Financial Information:</strong> Bank account details, gig
                platform credentials, income data, and tax documents
              </li>
              <li>
                <strong>Lender Information:</strong> Institution name, licensing
                details, lending criteria, and business contact information
              </li>
              <li>
                <strong>Communications:</strong> Messages exchanged through our
                platform and support inquiries
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Device Information:</strong> IP address, browser type,
                operating system, and device identifiers
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, time
                spent, and interaction patterns
              </li>
              <li>
                <strong>Location Data:</strong> General geographic location based
                on IP address
              </li>
              <li>
                <strong>Cookies and Tracking:</strong> Session cookies, analytics
                cookies, and similar technologies
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              2.3 Information from Third Parties
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Financial Platforms:</strong> Income data from connected
                gig economy platforms and bank accounts via Plaid
              </li>
              <li>
                <strong>Identity Verification:</strong> Data from identity
                verification services
              </li>
              <li>
                <strong>Public Records:</strong> Business registration and
                licensing information for Lenders
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Verify your identity and authenticate your account</li>
              <li>Aggregate and verify income information</li>
              <li>Generate income reports for loan applications</li>
              <li>Match Borrowers with appropriate Lenders</li>
              <li>Facilitate communications between users</li>
              <li>Process payments and subscriptions</li>
              <li>Send service-related communications</li>
              <li>Detect and prevent fraud and security threats</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns and improve user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              4.1 With Your Consent
            </h3>
            <p>
              We share your income verification reports and related information
              with Lenders only when you explicitly authorize such sharing through
              our platform.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              4.2 With Service Providers
            </h3>
            <p>
              We share information with third-party vendors who perform services
              on our behalf, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cloud hosting providers (AWS)</li>
              <li>App store payment processing (Apple App Store, Google Play)</li>
              <li>Financial data aggregators (Plaid)</li>
              <li>Identity verification services</li>
              <li>Analytics providers</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              4.3 For Legal Reasons
            </h3>
            <p>We may disclose information when required to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with applicable laws and regulations</li>
              <li>Respond to valid legal processes</li>
              <li>Protect our rights and property</li>
              <li>Investigate potential violations of our Terms</li>
              <li>Protect the safety of users or the public</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              4.4 Business Transfers
            </h3>
            <p>
              In connection with a merger, acquisition, or sale of assets, user
              information may be transferred to the acquiring entity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Multi-factor authentication options</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and employee training</li>
              <li>Secure data centers with SOC 2 Type II certification</li>
              <li>Monitoring and logging of system access</li>
            </ul>
            <p className="mt-4">
              While we strive to protect your information, no method of
              transmission or storage is 100% secure. We cannot guarantee absolute
              security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p>We retain your information for as long as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your account is active</li>
              <li>Needed to provide our services</li>
              <li>Required by law or regulation</li>
              <li>Necessary for legitimate business purposes</li>
            </ul>
            <p className="mt-4">
              Income verification reports are retained for 7 years to comply with
              financial record-keeping requirements. You may request deletion of
              your account, subject to legal retention requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your information
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a portable
                format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Restrict Processing:</strong> Limit how we use your data
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Revoke previously granted
                permissions
              </li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@1099pass.com. We
              will respond within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the California
              Consumer Privacy Act, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know whether personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to access personal information</li>
              <li>Right to equal service and price</li>
            </ul>
            <p className="mt-4">
              <strong>We do not sell your personal information.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for basic site
                functionality
              </li>
              <li>
                <strong>Analytics Cookies:</strong> To understand how users
                interact with our Service
              </li>
              <li>
                <strong>Preference Cookies:</strong> To remember your settings and
                preferences
              </li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Disabling
              cookies may affect site functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children&apos;s Privacy</h2>
            <p>
              Our Service is not intended for individuals under 18 years of age.
              We do not knowingly collect personal information from children. If
              you believe we have collected information from a child, please
              contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence. We ensure appropriate
              safeguards are in place for such transfers, including Standard
              Contractual Clauses approved by relevant data protection
              authorities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you
              of material changes by posting the new policy on our website and
              updating the &quot;Last Updated&quot; date. We encourage you to review this
              policy regularly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <p className="mt-4">
              <strong>1099Pass, Inc.</strong>
              <br />
              Privacy Team
              <br />
              Email: privacy@1099pass.com
              <br />
              Address: 123 Financial District, Suite 500, Wilmington, DE 19801
            </p>
            <p className="mt-4">
              For data protection inquiries in the EU, you may also contact our
              Data Protection Officer at dpo@1099pass.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
