import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add the alias for "@/..."
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  }
  /* other config options here */
};

export default nextConfig;

