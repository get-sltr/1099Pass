import { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FCRA Disclaimer | 1099Pass',
  description: 'Fair Credit Reporting Act disclaimer and compliance information for 1099Pass',
};

export default function FCRADisclaimerPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-4xl font-bold text-foreground">
          FCRA Disclaimer
        </h1>

        <div className="mb-8 rounded-lg border border-warning/30 bg-warning/10 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Important Notice for Lenders
              </h2>
              <p className="text-muted-foreground">
                This page contains important information about the Fair Credit
                Reporting Act (FCRA) and your obligations when using 1099Pass
                income verification reports. Please read carefully.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Effective Date: February 1, 2025
          <br />
          Last Updated: February 1, 2025
        </p>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. 1099Pass Is Not a Consumer Reporting Agency
            </h2>
            <p>
              <strong>
                1099Pass, Inc. is NOT a &quot;consumer reporting agency&quot; as defined
                by the Fair Credit Reporting Act (15 U.S.C. &sect; 1681 et seq.)
                (&quot;FCRA&quot;).
              </strong>
            </p>
            <p>
              The income verification reports and related information provided
              through 1099Pass do not constitute &quot;consumer reports&quot; as defined
              by the FCRA. 1099Pass does not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Collect or maintain files on consumers on a nationwide basis
              </li>
              <li>Assemble or evaluate consumer credit information</li>
              <li>
                Provide consumer reports for the purpose of serving as a factor
                in establishing consumer eligibility for credit, insurance, or
                employment
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Nature of 1099Pass Reports
            </h2>
            <p>
              1099Pass provides income verification services that aggregate and
              present income data from gig economy platforms and other sources.
              Our reports:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Are provided with the explicit consent and authorization of the
                borrower
              </li>
              <li>
                Contain only information that the borrower has chosen to share
              </li>
              <li>
                Are intended to supplement, not replace, traditional credit
                underwriting processes
              </li>
              <li>
                Do not include credit scores, credit history, or payment behavior
              </li>
              <li>
                Are not intended to be the sole basis for any credit decision
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Lender Responsibilities
            </h2>
            <p>
              As a Lender using 1099Pass, you acknowledge and agree that:
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.1 FCRA Compliance
            </h3>
            <p>
              You are solely responsible for complying with all applicable
              provisions of the FCRA, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Obtaining proper consumer reports from FCRA-compliant consumer
                reporting agencies when required for credit decisions
              </li>
              <li>
                Providing required adverse action notices when denying credit
                based on information from consumer reports
              </li>
              <li>
                Following proper procedures for disputes and investigations
              </li>
              <li>
                Maintaining appropriate records as required by law
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.2 Proper Use of Information
            </h3>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use 1099Pass reports only as one component of your underwriting
                process
              </li>
              <li>
                Not use 1099Pass reports as a substitute for proper credit
                reports when FCRA requires their use
              </li>
              <li>
                Obtain all necessary consents and authorizations before accessing
                borrower information
              </li>
              <li>
                Use borrower information only for the permissible purposes for
                which consent was obtained
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.3 Adverse Action Notices
            </h3>
            <p>
              If you take adverse action against a consumer based in whole or in
              part on information contained in a 1099Pass report, you are
              responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Determining whether FCRA adverse action notice requirements apply
              </li>
              <li>
                Providing appropriate notices as required by applicable law
              </li>
              <li>
                Including accurate contact information for 1099Pass if the
                borrower has questions about the income data
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Equal Credit Opportunity Act (ECOA)
            </h2>
            <p>
              As a Lender, you are responsible for compliance with the Equal
              Credit Opportunity Act (15 U.S.C. &sect; 1691 et seq.) and
              Regulation B (12 C.F.R. Part 1002). You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Not discriminate against any applicant on a prohibited basis
              </li>
              <li>
                Provide required adverse action notices in compliance with ECOA
              </li>
              <li>
                Apply consistent underwriting standards across all applicants
              </li>
              <li>
                Not use 1099Pass information in any manner that would result in
                unlawful discrimination
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. State Law Compliance
            </h2>
            <p>
              Various states have enacted laws governing the use of income
              verification, alternative data, and consumer financial information.
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Understanding and complying with applicable state laws in
                jurisdictions where you operate
              </li>
              <li>
                Obtaining any required state licenses or registrations
              </li>
              <li>
                Following state-specific disclosure and notice requirements
              </li>
              <li>
                Adhering to state interest rate and fee limitations
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              6. Dispute Resolution for Borrowers
            </h2>
            <p>
              If a borrower disputes the accuracy of information in their
              1099Pass report:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The borrower should first contact 1099Pass directly to review and
                correct their income data
              </li>
              <li>
                1099Pass will investigate disputes and make corrections where
                appropriate
              </li>
              <li>
                Corrected reports will be made available to the borrower and any
                Lenders who previously accessed the disputed report
              </li>
            </ul>
            <p className="mt-4">
              <strong>Borrower Dispute Contact:</strong>
              <br />
              Email: disputes@1099pass.com
              <br />
              Phone: 1-800-1099PASS
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              1099Pass provides income verification data based on information
              obtained from third-party sources and user-provided data. While we
              strive for accuracy:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                We do not guarantee the accuracy, completeness, or timeliness of
                all information
              </li>
              <li>
                Lenders are responsible for their own credit decisions
              </li>
              <li>
                1099Pass is not liable for lending decisions made using our
                reports
              </li>
              <li>
                Lenders should conduct their own due diligence and verification
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Certification
            </h2>
            <p>
              By using 1099Pass as a Lender, you certify that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You have read and understand this FCRA Disclaimer
              </li>
              <li>
                You understand that 1099Pass is not a consumer reporting agency
              </li>
              <li>
                You will comply with all applicable federal and state laws
              </li>
              <li>
                You will use 1099Pass reports only for legitimate lending
                purposes
              </li>
              <li>
                You will not use 1099Pass reports as a substitute for FCRA-
                compliant consumer reports when required by law
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Contact Information
            </h2>
            <p>
              For questions about this FCRA Disclaimer or 1099Pass compliance:
            </p>
            <p className="mt-4">
              <strong>1099Pass, Inc.</strong>
              <br />
              Compliance Department
              <br />
              Email: compliance@1099pass.com
              <br />
              Phone: 1-800-1099PASS
              <br />
              Address: 123 Financial District, Suite 500, Wilmington, DE 19801
            </p>
          </section>

          <section className="mt-12 rounded-lg border bg-muted/50 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Additional Resources
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Fair Credit Reporting Act (FTC)
                </a>
              </li>
              <li>
                <a
                  href="https://www.consumerfinance.gov/compliance/compliance-resources/deposit-accounts-resources/truth-in-savings-act/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Consumer Financial Protection Bureau Resources
                </a>
              </li>
              <li>
                <a
                  href="https://www.ftc.gov/legal-library/browse/statutes/equal-credit-opportunity-act"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Equal Credit Opportunity Act (FTC)
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
