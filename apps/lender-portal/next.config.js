/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@1099pass/shared'],
  typedRoutes: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Production: drop console.log (keep error/warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // S3 + CloudFront: use BUILD_FOR_S3=true to produce static out/ for aws s3 sync
  output: process.env.BUILD_FOR_S3 === 'true' ? 'export' : 'standalone',
};

module.exports = nextConfig;
