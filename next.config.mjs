/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  },
  // Disable server-side features for static export
  async headers() {
    return [];
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  }
};

export default nextConfig;
