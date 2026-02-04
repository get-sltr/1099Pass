import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | 1099Pass',
  description: 'Terms of Service for 1099Pass lender portal',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-foreground">
          Terms of Service
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
              Welcome to 1099Pass (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of
              Service (&quot;Terms&quot;) govern your access to and use of the 1099Pass
              platform, including our website, mobile applications, and related
              services (collectively, the &quot;Service&quot;).
            </p>
            <p>
              By accessing or using our Service, you agree to be bound by these
              Terms. If you disagree with any part of the Terms, you may not
              access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              1099Pass provides a platform that enables self-employed individuals
              and gig economy workers (&quot;Borrowers&quot;) to aggregate, verify, and
              share their income information with financial institutions
              (&quot;Lenders&quot;) for the purpose of obtaining loans and other financial
              products.
            </p>
            <p>Our Service includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Income verification and aggregation from multiple sources</li>
              <li>Generation of standardized income reports</li>
              <li>Secure sharing of financial information with authorized Lenders</li>
              <li>Matching Borrowers with appropriate lending opportunities</li>
              <li>Communication tools between Borrowers and Lenders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p>
              To use certain features of our Service, you must register for an
              account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Lender Terms</h2>
            <p>
              If you are registering as a Lender, you additionally agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Provide valid licensing information and maintain all required
                licenses for your lending activities
              </li>
              <li>
                Comply with all applicable federal, state, and local laws and
                regulations, including the Equal Credit Opportunity Act, Fair
                Credit Reporting Act, and state lending laws
              </li>
              <li>
                Use Borrower information solely for legitimate lending purposes
                and in compliance with our Privacy Policy
              </li>
              <li>
                Not engage in predatory lending practices or discrimination
              </li>
              <li>
                Respond to Borrower inquiries in a timely and professional manner
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape, harvest, or collect user data without authorization</li>
              <li>Impersonate another person or entity</li>
              <li>Use the Service to send spam or unsolicited communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Fees and Payment</h2>
            <p>
              Certain features of our Service require payment of fees. By
              subscribing to a paid plan, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay all applicable fees as described on our pricing page</li>
              <li>Provide valid payment information</li>
              <li>Authorize recurring charges for subscription plans</li>
              <li>
                Accept that fees are non-refundable except as expressly stated
              </li>
            </ul>
            <p>
              We reserve the right to modify our fees upon 30 days&apos; notice.
              Continued use of the Service after a fee change constitutes
              acceptance of the new fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Accuracy</h2>
            <p>
              While we strive to provide accurate income verification and
              reporting, we cannot guarantee the accuracy, completeness, or
              timeliness of all information. Users should:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verify the accuracy of their own information</li>
              <li>Report any errors or discrepancies promptly</li>
              <li>
                Understand that our reports are one factor in lending decisions
                and not a guarantee of loan approval
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by 1099Pass and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              laws.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of
              our Service without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, 1099PASS SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
              DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES.
            </p>
            <p>
              IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US
              IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
              LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, secure, or
              error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless 1099Pass and its
              officers, directors, employees, and agents from any claims,
              liabilities, damages, losses, and expenses arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your lending decisions or practices (for Lenders)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice, for conduct that we believe
              violates these Terms or is harmful to other users, us, or third
              parties, or for any other reason.
            </p>
            <p>
              You may terminate your account at any time by contacting us. Upon
              termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Delaware, without regard to its conflict of
              law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or your use of the Service
              shall be resolved through binding arbitration in accordance with the
              American Arbitration Association&apos;s rules. The arbitration shall
              take place in Wilmington, Delaware.
            </p>
            <p>
              You agree to waive your right to a jury trial and to participate in
              a class action lawsuit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify you of material changes by posting the updated Terms on our
              website and updating the &quot;Last Updated&quot; date.
            </p>
            <p>
              Your continued use of the Service after changes become effective
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-4">
              <strong>1099Pass, Inc.</strong>
              <br />
              Email: legal@1099pass.com
              <br />
              Address: 123 Financial District, Suite 500, Wilmington, DE 19801
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
