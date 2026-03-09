import Link from 'next/link';
import { Building2, ArrowRight, Calendar } from 'lucide-react';
import { blogPosts, blogBasePath, siteUrl } from '@/lib/blog-posts';

const jsonLdBlog = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: '1099Pass Blog',
  description:
    'Guides on getting a mortgage or loan as a gig worker or 1099 contractor. Income verification, conventional loans, and how 1099Pass helps.',
  url: `${siteUrl}${blogBasePath}`,
  publisher: {
    '@type': 'Organization',
    name: '1099Pass',
    url: siteUrl,
  },
  blogPost: blogPosts.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: post.author },
    url: `${siteUrl}${blogBasePath}/${post.slug}`,
  })),
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }}
      />

      {/* Nav — match landing */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">1099Pass</span>
            <span className="text-sm text-muted-foreground ml-2">for Lenders</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
            <Link href={blogBasePath} className="text-foreground font-medium">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-foreground hover:text-accent transition font-medium">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Mortgage & Loan Guides for Gig Workers and 1099 Contractors
            </h1>
            <p className="text-xl text-muted-foreground">
              Research and tips on getting a mortgage or loan with gig and 1099 income.
              Income verification, conventional loans, FHA, VA, and how 1099Pass helps you prove your income to lenders.
            </p>
          </div>
        </div>
      </header>

      {/* Post list */}
      <main className="container mx-auto px-6 py-12 pb-24">
        <div className="max-w-3xl mx-auto space-y-10">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group border-b border-border pb-10 last:border-0"
            >
              <Link href={`${blogBasePath}/${post.slug}`} className="block">
                <time
                  dateTime={post.publishedAt}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2"
                >
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <h2 className="text-2xl font-bold text-foreground group-hover:text-accent transition mb-2">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4">{post.description}</p>
                <span className="inline-flex items-center gap-1 text-accent font-medium">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </article>
          ))}
        </div>
      </main>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to prove your income to lenders?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            1099Pass creates lender-ready income verification reports for gig workers and 1099 contractors.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-white text-primary text-lg px-8 py-4 rounded-lg hover:bg-white/90 transition font-medium"
          >
            Get started at 1099pass.com
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">1099Pass</span>
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
                Home
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">
                Terms
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">2026 1099Pass by SLTR Digital LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
