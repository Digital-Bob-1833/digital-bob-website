/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['i.imgur.com'],
    unoptimized: true
  },
  experimental: {}
}

module.exports = nextConfig 