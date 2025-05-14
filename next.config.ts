/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
