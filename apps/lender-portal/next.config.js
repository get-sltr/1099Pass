/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@1099pass/shared'],
  experimental: {
    // typedRoutes disabled until all routes are implemented
    typedRoutes: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
