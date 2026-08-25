import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: [
    "langchain",
    "@langchain/core",
    "@langchain/openai",
    "@langchain/langgraph",
  ],
};

export default nextConfig;
