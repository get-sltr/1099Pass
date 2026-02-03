/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@1099pass/shared'],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
