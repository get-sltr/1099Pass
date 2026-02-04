import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Corporate, trustworthy dark blue
        primary: {
          DEFAULT: '#0F172A',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Forest green accent (matching borrower app brand)
        accent: {
          DEFAULT: '#1B4D3E',
          50: '#E8F5F1',
          100: '#D1EBE3',
          200: '#A3D7C7',
          300: '#75C3AB',
          400: '#47AF8F',
          500: '#1B4D3E',
          600: '#163F33',
          700: '#113128',
          800: '#0C231D',
          900: '#071512',
        },
        // Mint soft (borrower app brand color)
        mint: {
          DEFAULT: '#A8E6CF',
          soft: '#E8F8F0',
        },
        // Background colors
        background: '#F8FAFC',
        surface: '#FFFFFF',
        sidebar: '#0F172A',
        // Semantic colors
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#1B4D3E',
        // Data colors
        positive: '#10B981',
        negative: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        // Score colors (consistent with borrower app)
        score: {
          excellent: '#10B981', // A grade
          good: '#34D399',      // B grade
          fair: '#F59E0B',      // C grade
          poor: '#F97316',      // D grade
          veryPoor: '#EF4444', // F grade
        },
        // shadcn/ui compatible colors
        foreground: '#0F172A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'data-lg': ['1.5rem', { lineHeight: '2rem' }],
        'data-xl': ['2rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in-from-right 0.2s ease-out',
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
      },
      maxWidth: {
        'content': '1440px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
