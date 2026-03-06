/**
 * Blog posts for 1099Pass — SEO-focused content for gig workers, 1099 income, mortgages, and loans.
 * Targets: mortgage for gig workers, 1099 loans, conventional loans, self-employed lending.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Publish date ISO */
  publishedAt: string;
  /** Author display name */
  author: string;
  /** Keywords for meta and SEO */
  keywords: string[];
  /** Full article body (supports simple HTML/markdown-like) */
  content: string;
  /** OG image path or absolute URL */
  image?: string;
}

const SITE_URL = 'https://1099pass.com';

export const blogPosts: BlogPost[] = [
  {
    slug: 'can-gig-workers-get-a-mortgage',
    title: 'Can Gig Workers Get a Mortgage? A Complete Guide for 1099 and Freelance Income',
    description:
      'Learn how gig workers and 1099 contractors can qualify for a mortgage. Income verification, lender requirements, and how 1099Pass helps you prove your income to get approved.',
    publishedAt: '2025-01-15',
    author: '1099Pass',
    keywords: [
      'gig worker mortgage',
      '1099 mortgage',
      'freelance income mortgage',
      'self-employed mortgage',
      'income verification mortgage',
      'gig economy loan',
    ],
    content: `
      <p>If you earn income from Uber, DoorDash, Lyft, Upwork, or other gig platforms, you may wonder: <strong>can gig workers get a mortgage?</strong> The short answer is yes—but lenders need clear, verified proof of your income. Here’s what you need to know.</p>

      <h2>Why Lenders Are Cautious About Gig and 1099 Income</h2>
      <p>Traditional mortgages were designed for W-2 employees with predictable pay stubs. Gig and 1099 income can look inconsistent on bank statements, which makes some lenders hesitant. That’s why <strong>income verification</strong> tailored to gig workers matters so much.</p>

      <h2>How Lenders Evaluate Gig Worker Income</h2>
      <p>Many lenders now use <strong>12–24 months of income history</strong> to calculate an average or trend. They look at:</p>
      <ul>
        <li>Stability and consistency of deposits</li>
        <li>Multiple income sources (e.g., rideshare + delivery)</li>
        <li>Year-over-year growth or decline</li>
        <li>Tax returns and 1099 forms</li>
      </ul>
      <p>Having a <strong>standardized, lender-ready income report</strong> can speed up underwriting and improve your chances of approval.</p>

      <h2>Steps to Improve Your Chances as a Gig Worker</h2>
      <ol>
        <li><strong>Keep clear records.</strong> Link your bank accounts so income can be verified automatically.</li>
        <li><strong>Show multiple months.</strong> The more history you have, the better.</li>
        <li><strong>Use a verification tool.</strong> 1099Pass creates lender-ready income reports that many institutions accept.</li>
      </ol>

      <p>1099Pass is a data intelligence platform that turns your gig and 1099 income into a clean, verified report—so lenders can say yes with confidence. <a href="${SITE_URL}">Learn more at 1099pass.com</a>.</p>
    `.trim(),
  },
  {
    slug: '1099-income-loans-conventional-fha-va',
    title: '1099 Income and Loans: Conventional, FHA, and VA Options for Self-Employed Borrowers',
    description:
      'How to use 1099 income to qualify for conventional, FHA, and VA loans. Documentation, income calculation, and verification tips for self-employed and gig workers.',
    publishedAt: '2025-01-10',
    author: '1099Pass',
    keywords: [
      '1099 income loan',
      'conventional loan 1099',
      'FHA loan self-employed',
      'VA loan 1099',
      'self-employed mortgage',
      '1099 mortgage approval',
    ],
    content: `
      <p><strong>1099 income</strong> doesn’t disqualify you from a mortgage—but you do need the right documentation. Here’s how conventional, FHA, and VA loans treat 1099 and self-employed income.</p>

      <h2>Conventional Loans and 1099 Income</h2>
      <p>Conventional lenders (Fannie Mae, Freddie Mac guidelines) typically want <strong>two years of 1099 or self-employment history</strong>. They often use the average of two years of income or the most recent year if income is rising. A clear, verified income report can support your application and speed up underwriting.</p>

      <h2>FHA Loans for Self-Employed Borrowers</h2>
      <p>FHA loans can be more flexible with income types. Lenders still need to verify stability—usually through tax returns, profit-and-loss statements, and sometimes bank statements. A single, standardized income verification report can reduce back-and-forth and help you get to closing faster.</p>

      <h2>VA Loans and Gig/1099 Income</h2>
      <p>Veterans and active-duty service members with gig or 1099 income can qualify for VA loans. The VA doesn’t require a minimum length of self-employment; lenders focus on whether income is likely to continue. Verified income reports are a strong way to show consistency.</p>

      <h2>Why Verification Matters</h2>
      <p>Lenders need to be sure your income is real and ongoing. 1099Pass creates <strong>lender-ready income verification reports</strong> that aggregate your gig and 1099 income into a format underwriters understand—helping you get the loan you deserve. <a href="${SITE_URL}">Get started at 1099pass.com</a>.</p>
    `.trim(),
  },
  {
    slug: 'conventional-loan-requirements-self-employed',
    title: 'Conventional Loan Requirements for Self-Employed and 1099 Borrowers',
    description:
      'Conventional loan requirements when you’re self-employed or have 1099 income. Income documentation, DTI, and how to present your finances to qualify.',
    publishedAt: '2025-01-05',
    author: '1099Pass',
    keywords: [
      'conventional loan self-employed',
      'conventional loan 1099',
      'self-employed loan requirements',
      '1099 documentation mortgage',
      'income verification conventional',
    ],
    content: `
      <p>Getting a <strong>conventional loan</strong> with self-employed or 1099 income is possible when you meet documentation and stability requirements. Here’s what lenders typically look for.</p>

      <h2>Income Documentation</h2>
      <p>Most conventional lenders want:</p>
      <ul>
        <li>Two years of federal tax returns (personal and business if applicable)</li>
        <li>1099 forms and/or profit-and-loss statements</li>
        <li>Bank statements showing consistent deposits</li>
      </ul>
      <p>Some lenders also accept <strong>verified income reports</strong> that summarize your gig or 1099 income in a standardized way—reducing paperwork and speeding up decisions.</p>

      <h2>Stability and Trend</h2>
      <p>Lenders prefer to see stable or growing income. A report that shows your income history, trend, and diversity of sources can make your application stronger.</p>

      <h2>DTI and Reserves</h2>
      <p>Debt-to-income (DTI) and cash reserves matter for everyone. For self-employed borrowers, extra reserves can help offset perceived risk. Clean income verification supports an accurate DTI calculation.</p>

      <p>1099Pass helps self-employed and gig workers build a <strong>lender-ready income report</strong> so you can meet conventional loan requirements with confidence. <a href="${SITE_URL}">Learn more at 1099pass.com</a>.</p>
    `.trim(),
  },
  {
    slug: 'how-to-prove-income-gig-1099-mortgage',
    title: 'How to Prove Income for a Mortgage When You’re a Gig or 1099 Worker',
    description:
      'Step-by-step guide to proving your income for a mortgage as a gig worker or 1099 contractor. Documents, verification tools, and tips lenders actually use.',
    publishedAt: '2024-12-20',
    author: '1099Pass',
    keywords: [
      'prove income mortgage',
      'gig worker income verification',
      '1099 income verification',
      'self-employed prove income',
      'mortgage documentation gig',
    ],
    content: `
      <p>Proving income for a mortgage when you’re a <strong>gig worker</strong> or <strong>1099 contractor</strong> doesn’t have to be a maze. Here’s a clear path.</p>

      <h2>What Lenders Want to See</h2>
      <p>Lenders need to confirm that your income is real, consistent, and likely to continue. For gig and 1099 workers, that usually means:</p>
      <ul>
        <li>Tax returns (often 2 years)</li>
        <li>1099 forms</li>
        <li>Bank statements</li>
        <li>Sometimes: a single, verified income report that ties it all together</li>
      </ul>

      <h2>Why a Single Income Report Helps</h2>
      <p>Scattered 1099s and bank deposits can be hard for underwriters to interpret. A <strong>verified income report</strong> that aggregates your gig and 1099 income into one clear snapshot can simplify the process and help you get approved.</p>

      <h2>Using 1099Pass to Prove Your Income</h2>
      <p>1099Pass is built for gig and 1099 workers. We create lender-ready income verification reports that show your income history, stability, and sources—so you can walk into the loan process with proof lenders trust. <a href="${SITE_URL}">Start at 1099pass.com</a>.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export const blogBasePath = '/blog';
export const siteUrl = SITE_URL;
