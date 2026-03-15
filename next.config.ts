import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@google/genai"],
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/",
        permanent: false,
      },
      {
        source: "/work",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
