import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Use Policy | 1099Pass',
  description: 'How 1099Pass uses and protects borrower financial data',
};

export default function DataUsePolicyPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-foreground">
          Data Use Policy
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Effective Date: February 1, 2025
          <br />
          Last Updated: February 1, 2025
        </p>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p>
              This Data Use Policy explains how 1099Pass collects, processes, and
              shares financial data through our income verification platform. This
              policy applies to both Borrowers and Lenders using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Financial Data Collection
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              1.1 Data Sources
            </h3>
            <p>
              We collect financial data from the following sources with user
              authorization:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Gig Economy Platforms:</strong> Uber, Lyft, DoorDash,
                Instacart, Upwork, Fiverr, Etsy, and similar platforms
              </li>
              <li>
                <strong>Bank Accounts:</strong> Transaction history, account
                balances, and deposit information via Plaid
              </li>
              <li>
                <strong>Payment Processors:</strong> PayPal, Stripe, Square, and
                similar services
              </li>
              <li>
                <strong>Tax Documents:</strong> 1099 forms, tax returns, and
                related documents voluntarily provided
              </li>
              <li>
                <strong>User-Provided Information:</strong> Income details entered
                directly by users
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              1.2 Data Elements
            </h3>
            <p>The specific data elements we collect include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gross earnings by platform and time period</li>
              <li>Number of transactions or gigs completed</li>
              <li>Payment frequency and patterns</li>
              <li>Platform start dates and tenure</li>
              <li>Bank deposits matching platform payments</li>
              <li>Year-over-year income trends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. How We Process Data
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              2.1 Income Verification
            </h3>
            <p>Our verification process includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Cross-referencing income claims with bank deposits and platform
                data
              </li>
              <li>Detecting discrepancies and potential fraud indicators</li>
              <li>Calculating normalized income metrics</li>
              <li>Generating consistency and stability scores</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              2.2 Income Normalization
            </h3>
            <p>
              We normalize income data to provide lenders with standardized
              metrics:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Annualized income projections</li>
              <li>Monthly average calculations</li>
              <li>Seasonal adjustment factors</li>
              <li>Income volatility measures</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              2.3 Loan Readiness Scoring
            </h3>
            <p>
              Our proprietary scoring algorithm considers multiple factors:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Income consistency and trend direction</li>
              <li>Number and diversity of income sources</li>
              <li>Platform tenure and activity level</li>
              <li>Bank account health indicators</li>
              <li>Verification success rate</li>
            </ul>
            <p className="mt-4">
              <strong>Important:</strong> Our Loan Readiness Score is not a credit
              score and is not derived from credit bureau data. It is designed to
              help lenders evaluate non-traditional income.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Data Sharing with Lenders
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.1 Consent-Based Sharing
            </h3>
            <p>We share borrower data with lenders only when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The borrower has explicitly authorized sharing</li>
              <li>The borrower has selected specific lenders or loan types</li>
              <li>The sharing is for the purpose stated at time of consent</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.2 Data Shared with Lenders
            </h3>
            <p>Lenders receive income verification reports containing:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verified annual and monthly income figures</li>
              <li>Income source breakdown (without full platform credentials)</li>
              <li>Income trend analysis</li>
              <li>Loan Readiness Score</li>
              <li>Verification status and methodology</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.3 Data NOT Shared with Lenders
            </h3>
            <p>We do NOT share with lenders:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform login credentials</li>
              <li>Full bank account numbers</li>
              <li>Social Security Numbers</li>
              <li>Individual transaction details</li>
              <li>Personal messages or communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Lender Data Usage Restrictions
            </h2>
            <p>
              Lenders accessing 1099Pass data agree to the following restrictions:
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              4.1 Permitted Uses
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Evaluating loan applications from borrowers who have shared data
              </li>
              <li>Underwriting decisions for authorized loan products</li>
              <li>Communicating with borrowers about loan opportunities</li>
              <li>Compliance and regulatory reporting</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              4.2 Prohibited Uses
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Selling or reselling borrower data</li>
              <li>Using data for marketing unrelated products</li>
              <li>Sharing data with third parties without authorization</li>
              <li>Retaining data beyond permitted periods</li>
              <li>Using data for discriminatory purposes</li>
              <li>Re-identifying anonymized or aggregated data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Data Retention
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              5.1 Borrower Data
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Active accounts:</strong> Data retained while account is
                active
              </li>
              <li>
                <strong>Inactive accounts:</strong> Data deleted after 2 years of
                inactivity
              </li>
              <li>
                <strong>Generated reports:</strong> Retained for 7 years for
                compliance
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              5.2 Lender Access Logs
            </h3>
            <p>
              We maintain audit logs of all lender data access for a minimum of 7
              years, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Which lender accessed which borrower&apos;s data</li>
              <li>Date, time, and duration of access</li>
              <li>Specific data elements viewed</li>
              <li>Purpose stated for access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              6. Data Security
            </h2>
            <p>
              We protect financial data using industry-leading security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3
                in transit
              </li>
              <li>
                <strong>Access Control:</strong> Role-based access with
                multi-factor authentication
              </li>
              <li>
                <strong>Monitoring:</strong> 24/7 security monitoring and anomaly
                detection
              </li>
              <li>
                <strong>Auditing:</strong> Regular third-party security audits and
                penetration testing
              </li>
              <li>
                <strong>Compliance:</strong> SOC 2 Type II certification in
                progress
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Borrower Rights
            </h2>
            <p>Borrowers have the following rights regarding their data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> View all data we have collected about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your data (subject
                to legal requirements)
              </li>
              <li>
                <strong>Revocation:</strong> Revoke consent for data sharing at
                any time
              </li>
              <li>
                <strong>Export:</strong> Download your data in a portable format
              </li>
              <li>
                <strong>Audit:</strong> See which lenders have accessed your data
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Third-Party Data Providers
            </h2>
            <p>We work with the following third-party data providers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Plaid:</strong> Bank account and transaction data
                aggregation
              </li>
              <li>
                <strong>Platform APIs:</strong> Direct connections to gig economy
                platforms
              </li>
              <li>
                <strong>Identity verification:</strong> KYC/AML compliance
                providers
              </li>
            </ul>
            <p className="mt-4">
              Each provider has their own privacy policy and data practices. We
              require all providers to meet our security and privacy standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Data Use Policy periodically. Material changes
              will be communicated via email and in-app notification. Continued
              use of our services after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p>For questions about data use or to exercise your rights:</p>
            <p className="mt-4">
              <strong>1099Pass, Inc.</strong>
              <br />
              Data Privacy Team
              <br />
              Email: data@1099pass.com
              <br />
              Phone: 1-800-1099PASS
              <br />
              Address: 123 Financial District, Suite 500, Wilmington, DE 19801
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
