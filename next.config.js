/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only add this if you're using a custom subdomain/path on GitHub Pages
  // basePath: '/your-repo-name',
};

module.exports = nextConfig; 