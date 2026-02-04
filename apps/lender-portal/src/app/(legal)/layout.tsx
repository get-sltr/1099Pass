import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-white">1P</span>
            </div>
            <span className="text-lg font-semibold">1099Pass</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/fcra-disclaimer" className="hover:text-foreground transition-colors">
              FCRA Disclaimer
            </Link>
            <Link href="/data-use" className="hover:text-foreground transition-colors">
              Data Use Policy
            </Link>
            <Link href="/security" className="hover:text-foreground transition-colors">
              Security
            </Link>
          </nav>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 1099Pass, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
