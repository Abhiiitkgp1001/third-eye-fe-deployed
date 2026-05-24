import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to prevent file path leakage
  productionBrowserSourceMaps: false,

  // Security: Disable x-powered-by header
  poweredByHeader: false,

  // Allow loading images from external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.licdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.linkedin.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'static.licdn.com',
      },
    ],
  },
};

export default nextConfig;
