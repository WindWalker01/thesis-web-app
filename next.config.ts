import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**",
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "96mb",
    },
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
