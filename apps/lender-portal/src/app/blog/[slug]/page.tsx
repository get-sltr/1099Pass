import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, ArrowRight, Calendar, ArrowLeft } from 'lucide-react';
import {
  getPostBySlug,
  getAllSlugs,
  blogBasePath,
  siteUrl,
  type BlogPost,
} from '@/lib/blog-posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<import('next').Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post not found | 1099Pass' };

  const url = `${siteUrl}${blogBasePath}/${post.slug}`;
  return {
    title: `${post.title} | 1099Pass Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: '1099Pass',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

function ArticleJsonLd({ post }: { post: BlogPost }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: '1099Pass',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${blogBasePath}/${post.slug}`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      <ArticleJsonLd post={post} />

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

      <article className="container mx-auto px-6 py-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <Link
            href={blogBasePath}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <time
            dateTime={post.publishedAt}
            className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
          >
            <Calendar className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-ul:text-muted-foreground prose-li:my-1
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-foreground font-semibold mb-2">Ready to prove your income to lenders?</p>
            <p className="text-muted-foreground mb-4">
              1099Pass creates lender-ready income verification reports for gig workers and 1099 contractors. Get started at 1099pass.com.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition font-medium"
            >
              Get started at 1099pass.com
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </article>

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
              <Link href={blogBasePath} className="text-muted-foreground hover:text-foreground text-sm">
                Blog
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">
                Terms
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground font-medium">Stand by for the biggest update we&apos;re going to make.</p>
          <p className="text-center text-sm text-muted-foreground">© 2024 1099Pass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
