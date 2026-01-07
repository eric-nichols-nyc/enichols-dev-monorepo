import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  cacheComponents: true, // Enable Partial Pre-Rendering (PPR)
};

export default nextConfig;

