/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages serves content from a subdirectory matching the repo name
  // If your repo is named differently, change this value
  basePath: process.env.NODE_ENV === 'production' ? '/rock-paper-scissors-simulator' : '',
  images: {
    unoptimized: true,
  },
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
};

export default nextConfig;

