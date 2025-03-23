/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add CSS options for Next.js
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig; 