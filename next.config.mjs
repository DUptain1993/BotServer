/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
