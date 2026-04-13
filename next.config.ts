import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to prevent file path leakage
  productionBrowserSourceMaps: false,

  // Security: Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
