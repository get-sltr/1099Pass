import type { Metadata } from 'next';
import { blogBasePath, siteUrl } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | Gig Worker & 1099 Mortgage & Loan Guides | 1099Pass',
  description:
    'Guides on getting a mortgage or loan as a gig worker or 1099 contractor. Income verification, conventional loans, FHA, VA, and how 1099Pass helps you prove your income.',
  keywords: [
    'gig worker mortgage',
    '1099 mortgage',
    'conventional loan self-employed',
    '1099 income verification',
    'self-employed mortgage',
    'gig economy loan',
    '1099Pass',
  ],
  openGraph: {
    title: 'Blog | Gig Worker & 1099 Mortgage & Loan Guides | 1099Pass',
    description:
      'Guides on getting a mortgage or loan as a gig worker or 1099 contractor. Income verification and how 1099Pass helps.',
    url: `${siteUrl}${blogBasePath}`,
    siteName: '1099Pass',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Gig Worker & 1099 Mortgage & Loan Guides | 1099Pass',
    description: 'Guides on mortgages and loans for gig workers and 1099 contractors.',
  },
  alternates: {
    canonical: `${siteUrl}${blogBasePath}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
