import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B2B5E',
          50: '#E8EAF0',
          100: '#C5CAD9',
          500: '#1B2B5E',
          600: '#162448',
          700: '#111C38',
        },
        accent: {
          DEFAULT: '#00B4D8',
          50: '#E0F7FB',
          100: '#B3EBF5',
          500: '#00B4D8',
          600: '#0090AD',
        },
      },
    },
  },
  plugins: [],
};

export default config;
