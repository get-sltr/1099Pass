'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import {
  Landmark,
  Home,
  Car,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

const roles = [
  {
    icon: Landmark,
    title: 'Mortgage & Loan Professionals',
    description:
      'Receive pre-verified 1099 income packages, track non-QM rates in real time, and review AI-organized documents — all in one dashboard.',
  },
  {
    icon: Home,
    title: 'Real Estate Professionals',
    description:
      'Get your self-employed buyers mortgage-ready faster. AI-powered income verification eliminates the back-and-forth on missing documents.',
  },
  {
    icon: Car,
    title: 'Auto Finance Professionals',
    description:
      'Approve non-W2 car buyers with confidence. Receive organized, AI-verified income packages and cut approval time in half.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: 'rgba(10, 22, 40, 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="1099Pass" width={44} height={44} />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>1099Pass</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/blog" className="text-white/70 hover:text-white transition font-medium">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-white hover:text-white/80 transition font-medium">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition font-medium"
                style={{ backgroundColor: '#FF6B00' }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4" style={{ backgroundColor: '#0A1628' }}>
            <div className="flex flex-col gap-2">
              <Link href="/blog" className="py-2 text-white/70 hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <div className="border-t border-white/10 pt-4 mt-2 flex gap-4">
                <Link href="/login" className="text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className="text-white px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: '#FF6B00' }} onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-24 lg:py-36">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              The operating system for{' '}
              <span style={{ color: '#FF6B00' }}>1099 income</span>
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Document packages, pipeline tracking, and AI-powered verification
              for lending, auto, and real estate professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-white text-lg px-8 py-4 rounded-lg hover:opacity-90 transition font-medium"
                style={{ backgroundColor: '#FF6B00' }}
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center border border-white/20 text-white text-lg px-8 py-4 rounded-lg hover:bg-white/5 transition font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="p-8 rounded-xl border border-white/10 hover:border-white/20 transition"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center mb-5"
                    style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: '#FF6B00' }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    {role.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed">{role.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="1099Pass" width={36} height={36} />
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>1099Pass</span>
            </div>
            <div className="flex gap-6">
              <Link href="/blog" className="text-white/50 hover:text-white text-sm transition">
                Blog
              </Link>
              <Link href="/privacy" className="text-white/50 hover:text-white text-sm transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/50 hover:text-white text-sm transition">
                Terms of Service
              </Link>
              <Link href="/security" className="text-white/50 hover:text-white text-sm transition">
                Security
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              2026 1099Pass by SLTR Digital LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
