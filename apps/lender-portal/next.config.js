/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@1099pass/shared'],
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
