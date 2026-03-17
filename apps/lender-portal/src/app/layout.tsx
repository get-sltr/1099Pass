import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: '1099Pass — The Operating System for 1099 Income',
    template: '%s | 1099Pass',
  },
  description: 'AI-powered income verification for self-employed borrowers. Document packages, pipeline tracking, and loan readiness reports for lending, auto, and real estate professionals.',
  metadataBase: new URL('https://1099pass.com'),
  keywords: [
    '1099 income verification',
    'self-employed mortgage',
    'gig worker loans',
    'non-QM lending',
    'income verification platform',
    'bank statement loans',
    '1099 contractor mortgage',
    'freelancer income verification',
    'AI underwriting',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://1099pass.com',
    siteName: '1099Pass',
    title: '1099Pass — The Operating System for 1099 Income',
    description: 'AI-powered income verification for self-employed borrowers. Document packages, pipeline tracking, and loan readiness reports.',
    images: [{ url: '/logo.svg', width: 512, height: 512, alt: '1099Pass' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '1099Pass — The Operating System for 1099 Income',
    description: 'AI-powered income verification for self-employed borrowers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
