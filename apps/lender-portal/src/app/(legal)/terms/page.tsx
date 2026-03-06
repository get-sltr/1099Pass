import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | 1099Pass',
  description: 'Terms of Service for 1099Pass platform, website, and mobile application.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          1099PASS TERMS OF SERVICE
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Effective Date: March 6, 2026 | Last Updated: March 6, 2026
          <br />
          SLTR Digital LLC | Los Angeles, California
        </p>

        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold">
          <p className="mb-6 text-sm">
            PLEASE READ THESE TERMS OF SERVICE (&quot;TERMS&quot;, &quot;TERMS OF SERVICE&quot;, &quot;AGREEMENT&quot;) CAREFULLY BEFORE USING THE 1099PASS PLATFORM, WEBSITE (1099PASS.COM), MOBILE APPLICATION (iOS AND ANDROID), OR ANY RELATED SERVICES, TOOLS, CALCULATORS, EDUCATIONAL CONTENT, DOCUMENT PREPARATION FEATURES, ARTIFICIAL INTELLIGENCE FEATURES, OR APPLICATION PROGRAMMING INTERFACES (COLLECTIVELY, THE &quot;SERVICE&quot;) OPERATED BY SLTR DIGITAL LLC, A CALIFORNIA LIMITED LIABILITY COMPANY (&quot;COMPANY&quot;, &quot;1099PASS&quot;, &quot;WE&quot;, &quot;US&quot;, &quot;OUR&quot;).
          </p>
          <p className="mb-6 text-sm">
            YOUR ACCESS TO AND USE OF THE SERVICE IS CONDITIONAL ON YOUR ACCEPTANCE OF AND COMPLIANCE WITH THESE TERMS. THESE TERMS CONSTITUTE A LEGALLY BINDING AGREEMENT BETWEEN YOU AND SLTR DIGITAL LLC. BY CREATING AN ACCOUNT, ACCESSING, BROWSING, OR USING THE SERVICE IN ANY MANNER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND OUR PRIVACY POLICY, WHICH IS INCORPORATED HEREIN BY REFERENCE. IF YOU DO NOT AGREE TO ALL OF THESE TERMS, YOU ARE NOT AUTHORIZED TO USE THE SERVICE AND MUST IMMEDIATELY DISCONTINUE ALL USE.
          </p>
          <p className="mb-8 text-sm">
            IF YOU ARE USING THE SERVICE ON BEHALF OF AN ORGANIZATION, YOU REPRESENT AND WARRANT THAT YOU HAVE THE AUTHORITY TO BIND THAT ORGANIZATION TO THESE TERMS, AND &quot;YOU&quot; REFERS TO BOTH YOU INDIVIDUALLY AND THAT ORGANIZATION.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 1: NATURE OF THE SERVICE</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">1.1 Educational, Informational, and Document Preparation Platform</h3>
            <p className="mb-4">
              1099Pass is an educational, informational, and document preparation technology platform designed to assist individuals who earn income through non-traditional employment arrangements, including but not limited to gig economy workers, freelancers, independent contractors, sole proprietors, commission-based workers, 1099 income earners, self-employed individuals, and small business owners (collectively, &quot;Non-W2 Workers&quot; or &quot;Users&quot;). The Service provides, among other things:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Educational content regarding mortgage loan types, non-qualified mortgage (Non-QM) products, bank statement loans, 1099 income loans, profit and loss (P&amp;L) loans, asset depletion loans, DSCR loans, FHA loans, VA loans, USDA loans, conventional loans, auto loans, business loans, SBA loans, construction loans, refinancing, and other financial products available to Non-W2 Workers;</li>
              <li>Financial literacy resources including credit score education, credit improvement strategies, and general guidance regarding the relationship between tax reporting and lending qualification;</li>
              <li>Interactive mortgage and loan calculators that generate hypothetical payment estimates, scenario analyses, and affordability projections based on user-provided inputs and publicly available rate data;</li>
              <li>Artificial intelligence-powered scenario analysis tools that generate hypothetical loan scenarios, payment projections, qualification estimates, and educational recommendations based on user-provided financial information;</li>
              <li>Rate tracking tools that display current and historical mortgage rate data sourced from publicly available federal government and industry sources;</li>
              <li>Document preparation and organization tools that assist Users in compiling, categorizing, and packaging their financial documents, including bank statements, 1099 forms, tax returns, CPA letters, profit and loss statements, and other financial records, into organized, lender-ready document packages;</li>
              <li>Bank account connectivity through third-party financial data aggregation services (currently Plaid Inc.) that, with User authorization, retrieve transaction history and account information for the purpose of income categorization and document preparation; and</li>
              <li>A lender-facing portal (the &quot;Lender Portal&quot;) through which authorized lending professionals may access borrower document packages that have been explicitly and voluntarily shared by the borrower.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">1.2 1099Pass Is NOT a Financial Institution, Lender, Broker, or Advisor</h3>
            <p className="mb-2 font-medium">YOU EXPRESSLY ACKNOWLEDGE, UNDERSTAND, AND AGREE TO EACH OF THE FOLLOWING DECLARATIONS, WHICH ARE MATERIAL TERMS OF THIS AGREEMENT:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>1099Pass is NOT a mortgage lender, mortgage originator, mortgage banker, mortgage broker, mortgage servicer, loan officer, loan originator, consumer lender, commercial lender, credit provider, or any other type of entity that extends, offers, arranges, negotiates, brokers, or facilitates credit or loans of any kind, as those terms and roles are defined under applicable federal law, including but not limited to the Truth in Lending Act, the Real Estate Settlement Procedures Act, the Secure and Fair Enforcement for Mortgage Licensing Act, the Dodd-Frank Act, the Equal Credit Opportunity Act, the Fair Credit Reporting Act, and under applicable state law in all fifty (50) United States and the District of Columbia.</li>
              <li>1099Pass does NOT originate, underwrite, fund, guarantee, insure, service, purchase, sell, assign, or negotiate the terms of any mortgage, loan, line of credit, or any other extension of credit or financial product of any kind.</li>
              <li>1099Pass does NOT hold, process, transmit, receive, disburse, or have custody of consumer funds, escrow funds, trust funds, loan proceeds, down payments, earnest money deposits, settlement funds, or any monetary instruments of any kind.</li>
              <li>1099Pass is NOT a party to, and shall not be deemed a party to, any loan transaction, mortgage transaction, real estate settlement, closing, title transfer, or any other financial transaction between a User and any lender, financial institution, real estate professional, or other third party.</li>
              <li>1099Pass does NOT provide personalized financial advice, investment advice, tax advice, tax preparation services, accounting services, legal advice, legal representation, or any professional advisory services. All content, calculations, scenario analyses, AI-generated suggestions, credit improvement guidance, and educational materials provided through the Service are for general educational and informational purposes only.</li>
              <li>1099Pass does NOT make, influence, or participate in any credit decisions, lending decisions, underwriting decisions, loan approval decisions, rate-setting decisions, or any other decisions regarding the extension or denial of credit.</li>
              <li>1099Pass does NOT act as a lead generator for mortgage lenders within the meaning of applicable state mortgage licensing statutes. Document packages are shared with lenders only upon the explicit, affirmative, per-instance direction of the User.</li>
              <li>1099Pass does NOT generate &quot;consumer reports&quot; as that term is defined in Section 603(d) of the Fair Credit Reporting Act. Income normalization reports, document packages, scenario analyses, and all other outputs generated by the Service are informational and educational tools and are not intended to be used as, and shall not be construed as, consumer reports for any purpose.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">1.3 No Guarantee of Loan Approval, Terms, Rates, or Outcomes</h3>
            <p className="mb-4">
              Scenario analyses, rate estimates, mortgage payment calculations, loan affordability projections, loan type suggestions, credit improvement projections, AI-generated recommendations, and any other output generated by the Service (collectively, &quot;Service Outputs&quot;) are hypothetical projections generated for educational and informational purposes only. SERVICE OUTPUTS DO NOT CONSTITUTE AND SHALL NOT BE CONSTRUED AS: a pre-approval; a pre-qualification; a commitment to lend; a conditional approval; a guarantee of any loan terms, interest rates, APR, fees, costs, or qualification criteria; or a representation that any particular lender will approve your application. YOU ACKNOWLEDGE AND AGREE THAT YOU BEAR SOLE RESPONSIBILITY FOR ALL FINANCIAL DECISIONS YOU MAKE AND THAT 1099PASS SHALL HAVE NO LIABILITY WHATSOEVER FOR ANY FINANCIAL DECISION YOU MAKE BASED, IN WHOLE OR IN PART, ON SERVICE OUTPUTS OR ANY OTHER INFORMATION PROVIDED BY THE SERVICE.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-2">1.4 Consult Licensed Professionals</h3>
            <p className="mb-4">
              YOU ARE STRONGLY AND UNEQUIVOCALLY ADVISED TO CONSULT WITH QUALIFIED, LICENSED PROFESSIONALS BEFORE MAKING ANY FINANCIAL, TAX, LEGAL, OR REAL ESTATE DECISIONS, INCLUDING BUT NOT LIMITED TO: a licensed mortgage loan originator (MLO) or mortgage broker registered with the NMLS; a CPA or enrolled agent for tax strategy; a licensed real estate agent or broker; a licensed financial planner or investment advisor; and an attorney licensed in your state. THE SERVICE DOES NOT REPLACE THE ADVICE, JUDGMENT, OR SERVICES OF ANY LICENSED PROFESSIONAL.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 2: ARTIFICIAL INTELLIGENCE FEATURES</h2>
            <h3 className="text-xl font-medium mt-6 mb-2">2.1 Description of AI Features</h3>
            <p className="mb-4">
              The Service incorporates artificial intelligence technology (the &quot;AI Engine&quot;) that processes User-provided financial information and data to generate educational outputs including, but not limited to, hypothetical loan scenarios, payment projections, income optimization suggestions, credit improvement recommendations, loan type comparisons, and affordability analyses.
            </p>
            <h3 className="text-xl font-medium mt-6 mb-2">2.2 Zero Data Retention in AI</h3>
            <p className="mb-2 font-medium">CRITICAL: NO USER DATA IS STORED IN, RETAINED BY, CACHED BY, LOGGED BY, INDEXED BY, OR USED TO TRAIN THE AI MODEL OR ANY COMPONENT OF THE AI ENGINE&apos;S INFRASTRUCTURE.</p>
            <p className="mb-2">You acknowledge and agree to the following regarding the AI Engine:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The AI Engine processes your data exclusively in volatile memory (RAM) for the duration of a single request-response cycle. Your data exists in the AI processing environment only for the seconds required to generate a response and is then immediately and automatically discarded.</li>
              <li>No user data is written to any persistent storage medium within the AI processing environment.</li>
              <li>No user data is used to train, fine-tune, or otherwise improve or modify the AI model. Your data does not become part of the AI model.</li>
              <li>No user data processed by the AI Engine is accessible to any human being, except to the extent that the generated output is displayed to you within the Service.</li>
              <li>All data transmitted to the AI Engine is encrypted in transit using TLS 1.3 or higher.</li>
              <li>API calls to the AI service provider are configured with all available data retention opt-out mechanisms.</li>
            </ul>
            <h3 className="text-xl font-medium mt-6 mb-2">2.3 Limitations of AI-Generated Outputs</h3>
            <p className="mb-2">AI-generated outputs are hypothetical, generalized, educational, and informational only. You acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>AI-generated outputs may contain errors, inaccuracies, omissions, or outdated information. They are NOT financial, tax, legal, or investment advice.</li>
              <li>You are solely responsible for independently verifying all AI-generated outputs before relying on them, including by consulting qualified licensed professionals.</li>
              <li>1099Pass makes no warranty regarding the accuracy, reliability, completeness, or fitness for any particular purpose of any AI-generated output and shall not be liable for any loss arising from your reliance on AI-generated outputs.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 3: USER ACCOUNTS AND ELIGIBILITY</h2>
            <p className="mb-4"><strong>3.1 Eligibility.</strong> You must be at least 18 years of age, a legal resident of the United States, have legal capacity to enter into a binding agreement, and not be prohibited from using the Service under applicable law.</p>
            <p className="mb-4"><strong>3.2 Account Registration.</strong> You agree to provide truthful, accurate, current, and complete information and to promptly update it. 1099Pass reserves the right to suspend or terminate your account if information is untrue, inaccurate, or incomplete.</p>
            <p className="mb-4"><strong>3.3 Account Security.</strong> You are solely responsible for maintaining the confidentiality and security of your account credentials. You agree to create a strong password, enable MFA when available, not share credentials, and immediately notify 1099Pass at legal@1099pass.com of any unauthorized use.</p>
            <p className="mb-4"><strong>3.4 Accuracy of User-Provided Information.</strong> You represent and warrant that all information you provide is truthful, accurate, current, and complete. The accuracy of Service Outputs depends entirely on the accuracy of the information you provide. 1099PASS SHALL HAVE NO LIABILITY FOR ANY INACCURATE SERVICE OUTPUT THAT RESULTS FROM INACCURATE, INCOMPLETE, OR MISLEADING INFORMATION PROVIDED BY YOU.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 4: THIRD-PARTY SERVICES AND INTEGRATIONS</h2>
            <p className="mb-4"><strong>4.1 Plaid Integration.</strong> By connecting your financial accounts through Plaid, you acknowledge consent for 1099Pass to access your financial account information for document preparation and income categorization; that your use is subject to Plaid&apos;s End User Privacy Policy and terms; that 1099Pass does NOT receive or store your bank login credentials; that Plaid access tokens are encrypted with AWS KMS before storage; and that you may revoke your Plaid connection at any time through account settings.</p>
            <p className="mb-4"><strong>4.2 Rate Data Sources.</strong> Mortgage rate data is sourced from publicly available data (e.g., FRED, Freddie Mac PMMS, non-QM lender websites). These rates do NOT constitute offers to lend, rate quotes, or binding commitments. Actual rates may differ materially. 1099Pass does not guarantee the accuracy of rate data.</p>
            <p className="mb-4"><strong>4.3 Payment Processors.</strong> The Service uses Apple, Google, and Square to process subscription payments. Your payment information is collected and stored exclusively by these processors; 1099Pass does not collect, process, view, or store your payment card details.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 5: SUBSCRIPTION, PAYMENTS, AND CANCELLATION</h2>
            <p className="mb-4"><strong>5.1 Subscription Plans.</strong> The Service offers free and paid tiers. Paid access includes document preparation, AI-powered scenario analysis, and full calculator functionality. Pricing and features are described on the Service and may be updated at our sole discretion.</p>
            <p className="mb-4"><strong>5.2 Billing and Auto-Renewal.</strong> Paid subscriptions are billed through Apple App Store, Google Play, or Square. SUBSCRIPTIONS AUTOMATICALLY RENEW AT THE END OF EACH BILLING PERIOD UNLESS YOU CANCEL PRIOR TO THE RENEWAL DATE.</p>
            <p className="mb-4"><strong>5.3 Cancellation.</strong> You may cancel at any time via Apple ID settings (iOS), Google Play settings (Android), or account settings on the website. Cancellation takes effect at the end of the current billing period. Your data will NOT be deleted upon cancellation; it will be retained per our Privacy Policy unless you request account deletion.</p>
            <p className="mb-4"><strong>5.4 Refunds.</strong> No prorated refunds for partial billing periods. Refund requests for app store subscriptions must be submitted to the applicable store. For Square subscriptions, refund requests may be submitted to support@1099pass.com within seven (7) days of the most recent charge.</p>
            <p className="mb-4"><strong>5.5 Price Changes.</strong> We may change subscription pricing at any time. We will provide at least thirty (30) days&apos; advance notice of any price increase via email. You may cancel before the new price takes effect if you do not agree.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 6: INTELLECTUAL PROPERTY</h2>
            <p className="mb-4"><strong>6.1 Ownership.</strong> The Service and all associated intellectual property are the exclusive property of SLTR Digital LLC and/or its licensors, protected by U.S. and international copyright, trademark, patent, trade secret, and other IP laws.</p>
            <p className="mb-4"><strong>6.2 Limited License.</strong> Subject to your compliance with these Terms, 1099Pass grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial purposes. You may not copy, modify, distribute, reverse engineer, or use the Service for any commercial purpose without prior written consent.</p>
            <p className="mb-4"><strong>6.3 Your Content.</strong> You retain ownership of documents and data you upload (&quot;Your Content&quot;). By uploading, you grant 1099Pass a limited license to access, process, store, and transmit Your Content solely to provide the Service. This license terminates upon your deletion of Your Content or your account.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 7: PROHIBITED CONDUCT</h2>
            <p className="mb-4">You agree that you will not, and will not assist others to: use the Service unlawfully or fraudulently; commit or facilitate mortgage fraud, bank fraud, identity theft, or other financial crime; provide false or fraudulent information or forged documents; use the Service to obtain documents for fraudulent loan applications; gain unauthorized access to the Service or others&apos; accounts; use automated means (bots, scrapers, etc.) without authorization; interfere with or compromise the Service; introduce malware; harvest other users&apos; data; impersonate others; send spam; or circumvent security or access controls. Violation may result in immediate termination without refund. 1099Pass may report suspected illegal activity to law enforcement.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 8: DISCLAIMERS OF WARRANTIES</h2>
            <p className="mb-4">THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, SLTR DIGITAL LLC EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT; WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; AND WARRANTIES REGARDING THE ACCURACY OR RELIABILITY OF ANY RATE DATA, CALCULATOR OUTPUTS, AI-GENERATED SCENARIOS, OR OTHER INFORMATION. NO ADVICE OR INFORMATION FROM 1099PASS OR FROM ANY AI-GENERATED OUTPUT SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 9: LIMITATION OF LIABILITY</h2>
            <p className="mb-4">TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE 1099PASS PARTIES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; LOSS OF PROFITS, REVENUE, DATA, OR USE; DAMAGES ARISING FROM YOUR INABILITY TO OBTAIN A LOAN; DAMAGES ARISING FROM RATES, FEES, OR TERMS OFFERED BY LENDERS; DAMAGES FROM INACCURATE SERVICE OUTPUTS OR AI-GENERATED OUTPUTS; UNAUTHORIZED ACCESS TO OR LOSS OF YOUR DATA; OR DAMAGES FROM THE ACTS OF THIRD-PARTY PROVIDERS (PLAID, SQUARE, APPLE, GOOGLE, AI PROVIDERS), WHETHER BASED ON WARRANTY, CONTRACT, TORT, STRICT LIABILITY, OR ANY OTHER LEGAL THEORY.</p>
            <p className="mb-4">IN NO EVENT SHALL THE AGGREGATE LIABILITY OF THE 1099PASS PARTIES EXCEED THE GREATER OF: (I) THE TOTAL AMOUNT PAID BY YOU TO SLTR DIGITAL LLC FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM; OR (II) ONE HUNDRED DOLLARS ($100.00). SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; WHERE PROHIBITED, THEY MAY NOT APPLY TO YOU.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 10: INDEMNIFICATION</h2>
            <p className="mb-4">You agree to indemnify, defend, and hold harmless the 1099Pass Parties from and against any claims, demands, actions, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to: your access to or use of the Service; Your Content or information you provide; your violation of these Terms or any law or third-party right; any financial decision you make based on information from the Service; any dispute between you and any lender or third party; or your negligent or wrongful acts. 1099Pass may assume the exclusive defense of any matter subject to indemnification by you. Your indemnification obligation survives termination.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 11: DISPUTE RESOLUTION AND ARBITRATION</h2>
            <p className="mb-4"><strong>11.1 Governing Law.</strong> These Terms are governed by the internal laws of the State of California, without regard to conflict of law provisions.</p>
            <p className="mb-4"><strong>11.2 Mandatory Binding Arbitration.</strong> You and SLTR Digital LLC agree that any dispute arising out of or relating to these Terms or the Service shall be determined by binding arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules. The arbitration shall be conducted by a single arbitrator in Los Angeles County, California. The arbitrator&apos;s award shall be final, binding, and non-appealable.</p>
            <p className="mb-4"><strong>11.3 Class Action and Jury Trial Waiver.</strong> YOU AND SLTR DIGITAL LLC EACH AGREE THAT DISPUTE RESOLUTION WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU WAIVE YOUR RIGHT TO FILE OR PARTICIPATE IN A CLASS ACTION AGAINST SLTR DIGITAL LLC AND YOUR RIGHT TO A TRIAL BY JURY.</p>
            <p className="mb-4"><strong>11.4 Small Claims.</strong> Either party may bring an individual action in small claims court for disputes within that court&apos;s jurisdictional limits.</p>
            <p className="mb-4"><strong>11.5 Opt-Out.</strong> You may opt out of the arbitration provision by sending written notice to SLTR Digital LLC, Attn: Legal Department, legal@1099pass.com, within thirty (30) days of first creating your account. Your notice must include your full name, account email, and a clear statement that you opt out of the arbitration provision.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 12: TERMINATION</h2>
            <p className="mb-4"><strong>12.1 Termination by You.</strong> You may terminate your account at any time via the account deletion feature or by written request to privacy@1099pass.com. Upon deletion, all of your data will be permanently and irreversibly deleted per our Privacy Policy.</p>
            <p className="mb-4"><strong>12.2 Termination by 1099Pass.</strong> 1099Pass may suspend or terminate your account at any time, with or without cause or notice, including if you violate these Terms, engage in fraud or illegal activity, pose a security risk, or have been inactive for an extended period. No refund shall be provided for termination for cause.</p>
            <p className="mb-4"><strong>12.3 Effect of Termination.</strong> Upon termination, your right to access the Service ceases immediately. Sections that by their nature should survive (including Sections 1.2, 6, 7, 8, 9, 10, 11, and 13) shall survive.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 13: GENERAL PROVISIONS</h2>
            <p className="mb-2"><strong>13.1 Entire Agreement.</strong> These Terms, with the Privacy Policy and referenced policies, constitute the entire agreement between you and SLTR Digital LLC and supersede all prior agreements.</p>
            <p className="mb-2"><strong>13.2 Severability.</strong> If any provision is held invalid or unenforceable, the remaining provisions continue in full force and effect.</p>
            <p className="mb-2"><strong>13.3 Waiver.</strong> Failure to enforce any right or provision does not constitute a waiver. Any waiver must be in writing and signed by an authorized representative of SLTR Digital LLC.</p>
            <p className="mb-2"><strong>13.4 Assignment.</strong> You may not assign these Terms without prior written consent. SLTR Digital LLC may assign without restriction.</p>
            <p className="mb-2"><strong>13.5 Notices.</strong> Notices to you may be sent to the email associated with your account. Notices to SLTR Digital LLC should be sent to legal@1099pass.com.</p>
            <p className="mb-2"><strong>13.6 Force Majeure.</strong> SLTR Digital LLC shall not be liable for delay or failure due to causes beyond its reasonable control.</p>
            <p className="mb-2"><strong>13.7 Modifications.</strong> We may modify these Terms at any time. Material changes will be communicated with at least thirty (30) days&apos; advance notice. Your continued use after the effective date constitutes acceptance. If you do not agree, you must discontinue use and delete your account before the effective date.</p>
            <p className="mb-4"><strong>13.8 Headings.</strong> Section headings are for convenience only and do not affect interpretation.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">SECTION 14: CONTACT INFORMATION</h2>
            <p className="mb-4">
              For questions, concerns, or notices regarding these Terms of Service:
              <br /><br />
              <strong>SLTR Digital LLC</strong><br />
              Attn: Legal Department<br />
              Email: legal@1099pass.com<br />
              Website: https://1099pass.com
            </p>
            <p className="text-sm italic">
              By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
