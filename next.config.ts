import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  typedRoutes: true,
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
