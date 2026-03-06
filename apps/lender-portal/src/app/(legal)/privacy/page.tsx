import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | 1099Pass',
  description: 'How 1099Pass collects, uses, discloses, and protects your personal information. GLBA and CCPA/CPRA compliant.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          1099PASS PRIVACY POLICY
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Effective Date: March 6, 2026 | Last Updated: March 6, 2026
          <br />
          SLTR Digital LLC | Los Angeles, California
        </p>

        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold">
          <p className="mb-6 text-sm">
            This Privacy Policy (&quot;Policy&quot;) describes how SLTR Digital LLC (&quot;Company&quot;, &quot;1099Pass&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, discloses, stores, protects, retains, and deletes personal information and financial data in connection with the 1099Pass platform, website (1099pass.com), mobile application (iOS and Android), and all related services (collectively, the &quot;Service&quot;).
          </p>
          <p className="mb-6 text-sm">
            This Policy is designed to comply with the Gramm-Leach-Bliley Act (GLBA) and its implementing regulations; the California Consumer Privacy Act as amended by the California Privacy Rights Act (CCPA/CPRA); applicable state data protection laws (Virginia, Colorado, Connecticut, Utah, Montana, and others); and all other applicable federal and state privacy and data security laws.
          </p>
          <p className="mb-8 font-medium text-sm">
            BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THIS PRIVACY POLICY. IF YOU DO NOT AGREE WITH THE PRACTICES DESCRIBED IN THIS POLICY, DO NOT USE THE SERVICE.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 1: INFORMATION WE COLLECT</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">1.1 Information You Provide Directly</h3>
            <p className="mb-2">When you create an account and use the Service, you may provide:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Registration:</strong> Full legal name, email address, telephone number, and password.</li>
              <li><strong>Self-Reported Financial Information:</strong> Credit score range (estimated; we do not pull your credit report), approximate annual income, employment type, income sources, homeownership status and goals, desired loan types.</li>
              <li><strong>Uploaded Documents:</strong> 1099 forms, tax returns, CPA-prepared P&amp;L statements, CPA letters, bank statements (if not via Plaid), self-employment verification letters, and other financial records for your lender-ready document package.</li>
              <li><strong>Calculator and Scenario Inputs:</strong> Property price, down payment, loan term, loan type preferences, location (city/state), and other variables you enter.</li>
              <li><strong>Communications:</strong> Messages, inquiries, feedback, or other communications you send to us.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">1.2 Information Collected Through Plaid</h3>
            <p className="mb-2">If you connect financial accounts through Plaid Inc. (&quot;Plaid&quot;), we receive with your explicit consent:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Transaction History:</strong> Up to 24 months of transaction records (date, amount, merchant, category) for income categorization.</li>
              <li><strong>Account Information:</strong> Account name, type, financial institution name, masked account identifiers.</li>
              <li><strong>Account Balance:</strong> Current available and current balance for affordability analysis.</li>
              <li><strong>Identity Verification Data:</strong> Name, address, phone, email from your financial institution for KYC verification that the person connecting the account is the account holder.</li>
            </ul>
            <p className="mb-4 font-medium">IMPORTANT: WE DO NOT RECEIVE, ACCESS, VIEW, STORE, LOG, OR HAVE ANY KNOWLEDGE OF YOUR BANK LOGIN CREDENTIALS. All authentication with your financial institution occurs directly through Plaid. 1099Pass never has access to your bank username, password, PIN, security questions, or other authentication credentials.</p>

            <h3 className="text-xl font-medium mt-6 mb-2">1.3 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Device Information:</strong> Device type and model, OS and version, app version, unique device identifiers, screen resolution.</li>
              <li><strong>Usage Data:</strong> Features accessed, pages viewed, actions taken, time and date of access, time spent, interaction patterns (aggregate; used to improve the Service; does not include financial data or PII beyond account identifier).</li>
              <li><strong>Network Information:</strong> IP address and approximate geographic location (city/state from IP; no precise GPS). Used for rate localization and property tax estimation.</li>
              <li><strong>Performance Data:</strong> Crash reports, error logs (no PII or financial data), application performance metrics for technical issue resolution.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">1.4 Information We Do NOT Collect</h3>
            <p className="mb-2">1099Pass does NOT collect, store, access, process, or request:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Social Security Numbers (SSN) or ITIN;</li>
              <li>Bank login credentials (usernames, passwords, PINs, security Q&amp;A);</li>
              <li>Full credit reports or credit bureau data (we use only self-reported credit score ranges in V1);</li>
              <li>Biometric identifiers or biometric information;</li>
              <li>Health, medical, or genetic information;</li>
              <li>Political affiliations, religious or philosophical beliefs, sexual orientation, gender identity, racial or ethnic origin (except as voluntarily provided for fair lending if required), trade union membership;</li>
              <li>Criminal history or arrest records; or</li>
              <li>Information about children under 18.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 2: HOW WE USE YOUR INFORMATION</h2>
            <p className="mb-2">We use collected information solely for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Service Delivery:</strong> To provide, operate, maintain, and deliver the Service (educational content, rate tracking, calculators, AI scenario analysis, document preparation, income normalization, lender-ready document packaging).</li>
              <li><strong>AI Processing:</strong> To transmit your data to the AI engine for real-time scenario analyses and educational outputs. As stated in Section 5, no user data is stored, retained, cached, or used to train the AI model.</li>
              <li><strong>Account Management:</strong> To create and manage your account, verify identity, process subscription payments via third-party processors, and communicate regarding account, billing, and subscription.</li>
              <li><strong>Communication:</strong> Service-related communications (verification emails, password reset, subscription confirmations, important updates, security alerts, support responses). We will NOT send marketing emails without your explicit opt-in; you may unsubscribe from marketing at any time.</li>
              <li><strong>Rate Localization:</strong> To use approximate location (city/state from IP) for relevant mortgage rate data and local property tax/insurance estimates.</li>
              <li><strong>Service Improvement:</strong> To analyze aggregate, de-identified usage patterns. Analysis is on aggregate, statistical data that cannot identify any individual.</li>
              <li><strong>Security and Fraud Prevention:</strong> To detect, investigate, prevent, and respond to fraud, security incidents, unauthorized access, and illegal activities.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal process, governmental requests, and to enforce our Terms of Service.</li>
            </ul>
            <p className="mb-4 font-medium">WE DO NOT USE YOUR INFORMATION FOR: targeted advertising, behavioral advertising, cross-site tracking, data brokerage, the sale or rental of personal information, lead generation for third parties, or any purpose not explicitly described in this Policy.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 3: HOW WE SHARE (AND DO NOT SHARE) YOUR INFORMATION</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">3.1 We Do NOT Sell Your Personal Information</h3>
            <p className="mb-4 font-medium">1099PASS DOES NOT SELL, RENT, LEASE, TRADE, LICENSE, OR OTHERWISE DISCLOSE YOUR PERSONAL INFORMATION, FINANCIAL DATA, INCOME DATA, DOCUMENT CONTENTS, OR ACCOUNT INFORMATION TO ANY THIRD PARTY FOR MONETARY OR OTHER VALUABLE CONSIDERATION, FOR MARKETING, ADVERTISING, LEAD GENERATION, OR ANY OTHER COMMERCIAL PURPOSE. THIS PROHIBITION IS ABSOLUTE. For CCPA/CPRA purposes, 1099Pass does not &quot;sell&quot; or &quot;share&quot; personal information.</p>

            <h3 className="text-xl font-medium mt-6 mb-2">3.2 Limited, Necessary Disclosures</h3>
            <p className="mb-2">We disclose your information only in these strictly limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>At Your Explicit Direction:</strong> When you affirmatively choose to share your document package with a specific lender, you initiate that transmission. 1099Pass transmits only to the recipient you designate, only when you direct, and only the documents and data you authorize. Each share requires your separate, affirmative, per-instance consent. We do not proactively send your information to any lender.</li>
              <li><strong>Essential Service Providers:</strong> AWS (cloud, hosting, database, storage, encryption); Plaid (financial data aggregation); Square (web payment processing); Apple/Google (app store payments); AI service provider (volatile-memory processing only; no retention; see Section 5); Brevo (transactional email only). All providers are bound by contractual obligations that restrict use to providing services to 1099Pass, prohibit selling or using data for their own purposes, require security measures, and require deletion or return of data upon termination.</li>
              <li><strong>Legal Requirements:</strong> We may disclose if required by applicable law, regulation, subpoena, court order, or other valid legal process. We disclose only the minimum required. To the extent permitted by law, we will provide advance notice so you may seek a protective order.</li>
              <li><strong>Protection of Rights and Safety:</strong> If we believe in good faith that disclosure is reasonably necessary to protect rights, property, or safety; detect or prevent fraud or security issues; enforce our Terms; or respond to an emergency.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization, asset sale, or bankruptcy, your information may be transferred. The acquiring entity will be bound by this Policy; we will provide at least 30 days&apos; advance notice; and you will have the opportunity to delete your account and data prior to the transfer.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">3.3 We Do NOT Share With</h3>
            <p className="mb-2">We do not share your personal information or financial data with: advertisers, ad networks, or ad tech; data brokers or resellers; marketing agencies (other than Brevo for transactional email only); lenders or financial institutions unless you explicitly direct us to share a specific package on a per-instance basis; credit reporting agencies; employers or employment screeners; landlords or tenant screeners; insurance companies; government agencies except as compelled by valid legal process; social media companies; or any other third party not described in Section 3.2.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 4: DATA STORAGE AND SECURITY</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">4.1 Storage Location</h3>
            <p className="mb-4">All user data is stored exclusively within AWS data centers in the United States, in VPC environments with private subnets and no direct inbound internet access. NO USER DATA IS STORED on local servers or devices; on employee equipment; in local file systems; in any AI model, cache, log, or training dataset beyond a single request-response cycle; in any third-party cloud other than the AWS services described; or outside the United States.</p>

            <h3 className="text-xl font-medium mt-6 mb-2">4.2 Encryption Standards</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>At Rest:</strong> All data in RDS, S3, DynamoDB, and other persistent storage is encrypted with AES-256 managed via AWS KMS. Keys are hardware-backed, rotated regularly, and never in source code or config.</li>
              <li><strong>In Transit:</strong> All data transmitted is encrypted with TLS 1.3 or higher. No cleartext transmission. HSTS enforced.</li>
              <li><strong>Plaid Tokens:</strong> Encrypted with a dedicated AWS KMS CMK before database storage; decrypted only at moment of use in volatile memory. Plaintext tokens are never stored on disk or in logs.</li>
              <li><strong>Passwords:</strong> Hashed with bcrypt (cost factor 12 or equivalent) with unique salts. Not stored in plaintext or reversible form.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">4.3 Access Controls</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Zero-Trust:</strong> Every access request requires explicit authentication, authorization, and validation.</li>
              <li><strong>Least-Privilege:</strong> IAM roles, Lambdas, APIs, and DB connections have minimum required permissions.</li>
              <li><strong>Row-Level Security (RLS):</strong> PostgreSQL RLS ensures queries return only the authenticated user&apos;s data. Enforced by the database independent of application code.</li>
              <li><strong>MFA:</strong> Available for all user accounts (encouraged); mandatory for all administrative access.</li>
              <li><strong>Secrets:</strong> API keys, credentials, and sensitive config in AWS Secrets Manager; rotated on schedule; never in source code or logs.</li>
              <li><strong>Audit Logging:</strong> Access to financial data, modifications, admin actions, and security events logged with immutable audit trail (CloudTrail and application logging). Logs encrypted, append-only S3 with Object Lock; retained at least 7 years.</li>
              <li><strong>No PII in Logs:</strong> PII, financial data, account numbers, and sensitive data are never written to application, error, or debug logs. Sanitization enforced at framework level.</li>
              <li><strong>No Backdoors:</strong> No administrative override that bypasses security. All admin access requires MFA and is logged.</li>
              <li><strong>No Bulk Export:</strong> No bulk data export, data warehouse, or mechanism that aggregates user financial data across users. Each user&apos;s data is isolated.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 5: AI DATA HANDLING</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">5.1 Zero Data Retention</h3>
            <p className="mb-2">When you use AI-powered features:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Transmission:</strong> Your relevant data is encrypted (TLS 1.3) and sent to the AI engine via API with data retention opt-out parameters.</li>
              <li><strong>Processing:</strong> The AI engine receives data in volatile memory (RAM), processes it, and returns a response within seconds.</li>
              <li><strong>Discarding:</strong> Upon response completion, all user data in the AI environment is immediately and automatically discarded. No writing to disk, database, cache, log, or index. No retention.</li>
              <li><strong>No Training:</strong> Your data is not used to train, fine-tune, or modify the AI model.</li>
              <li><strong>No Human Review:</strong> No human reviews, reads, or accesses the content of your data as processed by the AI engine, except as you view the output in the Service.</li>
            </ul>
            <h3 className="text-xl font-medium mt-6 mb-2">5.2 AI Provider Contractual Requirements</h3>
            <p className="mb-4">The AI provider is contractually bound to: process data only as instructed and only for real-time responses; not retain, store, cache, log, or copy user data beyond a single request-response cycle; not use user data for model training or improvement; not disclose user data to third parties; maintain encryption in transit; comply with data protection laws; and permit 1099Pass to audit compliance.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 6: DATA DELETION POLICY</h2>
            <p className="mb-4 font-medium">DELETE MEANS DELETE. COMPLETELY. PERMANENTLY. IRREVERSIBLY. NO EXCEPTIONS.</p>
            <p className="mb-4"><strong>6.1 Your Right to Delete.</strong> You have the absolute right to delete your account and all associated data at any time, for any reason, without penalty. Use the &quot;Delete My Account&quot; feature in account settings, or email privacy@1099pass.com with subject &quot;Account Deletion Request&quot; and your registered email. We will verify your identity for email requests per CCPA/CPRA.</p>
            <p className="mb-4"><strong>6.2 Scope of Deletion.</strong> Within thirty (30) calendar days of a valid, verified request, we permanently and irreversibly delete from all systems: account profile and metadata; all financial data and Plaid-derived data; all Plaid tokens (and revoke via Plaid API); all uploaded documents; all generated reports and outputs; usage data linked to your account; payment records in our systems (note: Square, Apple, Google retain per their policies and law); and our copy of any document package you shared. We cannot delete copies already in a lender&apos;s possession.</p>
            <p className="mb-4"><strong>6.3 No Residual Data.</strong> After deletion: no personal or financial data retained; no anonymized, pseudonymized, or de-identified version retained (we do not anonymize as an alternative to deletion); no &quot;soft delete&quot;—deletion is hard, permanent DELETE from all tables and S3. Backups overwrite per rotation (max 30 days); after rotation no backup will contain the deleted user&apos;s data.</p>
            <p className="mb-4"><strong>6.4 Deletion Confirmation.</strong> We will send written confirmation to your last email certifying that all account data has been permanently and irreversibly deleted. You may request a formal Deletion Certificate from privacy@1099pass.com.</p>
            <p className="mb-4"><strong>6.5 Narrow Exception.</strong> We may retain specific data after a deletion request only if required by applicable law, valid subpoena or court order, or active legal proceeding. We retain only the minimum required, for the minimum duration, encrypted and access-restricted, and will notify you to the extent permitted by law.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 7: YOUR PRIVACY RIGHTS</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">7.1 California Residents (CCPA/CPRA)</h3>
            <p className="mb-2">If you are a California resident, you have:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Right to Know / Access:</strong> Request disclosure of categories and specific pieces of personal information we have collected, sources, business purpose, and third parties with whom we share.</li>
              <li><strong>Right to Delete:</strong> Request deletion. Our practices exceed CCPA/CPRA; we delete all data and do not rely on statutory exceptions.</li>
              <li><strong>Right to Correct:</strong> Request correction of inaccurate information. You may correct through account settings or submit to privacy@1099pass.com.</li>
              <li><strong>Right to Opt-Out of Sale or Sharing:</strong> 1099Pass does NOT sell or share personal information; this right is satisfied.</li>
              <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> We use sensitive information only for authorized purposes to provide the Service.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate for exercising your rights.</li>
            </ul>
            <p className="mb-4">To exercise: contact privacy@1099pass.com. We verify identity per CCPA/CPRA and respond within 45 calendar days (or notify of extension up to 45 additional days). Authorized agents may submit on your behalf with proof of written authorization; we may require you to verify directly.</p>
            <h3 className="text-xl font-medium mt-6 mb-2">7.2 Other States</h3>
            <p className="mb-4">If you reside in Virginia, Colorado, Connecticut, Utah, Montana, or another state with comprehensive privacy laws, you may have similar rights. We honor valid requests to privacy@1099pass.com consistent with this Policy.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 8: GLBA COMPLIANCE</h2>
            <p className="mb-4">To the extent 1099Pass is or may be deemed a &quot;financial institution&quot; under the GLBA, we comply as follows: This Policy constitutes our initial and annual privacy notice under the Privacy Rule (16 CFR Part 313). We do not disclose NPI to nonaffiliated third parties except as necessary to provide the Service, as you direct, or as required by law; the opt-out requirement does not apply, and your right to delete (Section 6) exceeds any opt-out. We maintain a written information security program under the Safeguards Rule (16 CFR Part 314), including designation of a qualified individual, risk assessment, safeguards (encryption, access control, monitoring), testing and monitoring, service provider oversight, program evaluation and adjustment, and employee/contractor training.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 9: CHILDREN&apos;S PRIVACY</h2>
            <p className="mb-4">The Service is not directed to, designed for, or intended for individuals under 18. We do not knowingly collect personal information from children under 18. If we learn we have inadvertently collected such information, we will promptly and permanently delete it. If you believe a child under 18 has provided personal information to us, contact privacy@1099pass.com immediately.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 10: DATA RETENTION</h2>
            <p className="mb-4">We retain your data only while your account is active and for the limited purposes in this Policy. Upon account deletion, all data is permanently deleted per Section 6. For active accounts: account and registration data for duration of account; Plaid-derived data for duration of account (refreshed periodically); uploaded documents and generated reports for duration of account; audit logs 7 years for regulatory compliance (audit logs do not contain PII or financial data content). We conduct periodic reviews to ensure no data is retained beyond necessary period.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 11: INTERNATIONAL DATA</h2>
            <p className="mb-4">The Service is intended solely for U.S. residents. All data is stored and processed in the United States. We do not transfer data outside the United States. If you access the Service from outside the U.S., you do so at your own risk and are responsible for compliance with your local laws.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 12: DO NOT TRACK</h2>
            <p className="mb-4">The Service does not currently respond to &quot;Do Not Track&quot; (DNT) browser signals due to lack of industry standard. Because we do not engage in cross-site tracking, behavioral advertising, or third-party tracking, the practical impact is the same regardless of DNT settings.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 13: CHANGES TO THIS PRIVACY POLICY</h2>
            <p className="mb-4">We may update this Policy to reflect changes in practices, technology, or legal requirements. Material changes will be communicated with at least thirty (30) days&apos; advance notice via: (a) email to your account address; (b) prominent notice in the Service (e.g., banner on login); or (c) updated Policy on our website with revised &quot;Last Updated&quot; date. Continued use after the effective date constitutes acceptance. If you do not agree, you must discontinue use and delete your account.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 14: CONTACT INFORMATION</h2>
            <p className="mb-4">
              For questions, concerns, or requests regarding this Privacy Policy, our data practices, or your privacy rights:
              <br /><br />
              <strong>SLTR Digital LLC</strong><br />
              Attn: Privacy Officer<br />
              Email: privacy@1099pass.com<br />
              Legal: legal@1099pass.com<br />
              Support: support@1099pass.com<br />
              Website: https://1099pass.com
            </p>
            <p className="mb-4">We will acknowledge receipt within two (2) business days and respond substantively within timeframes required by applicable law.</p>
            <p className="text-sm italic">
              This Privacy Policy was last updated on March 6, 2026. Your data. Your control. No exceptions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
