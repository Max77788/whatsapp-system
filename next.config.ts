import type { NextConfig } from "next";
import path from "path";
import { startCronJob } from "./lib/cron.mjs";
import { setupGoogleCloudCredentials } from "@/lib/google_storage/google_storage";

const nextConfig: NextConfig = {
  async headers() {
    // Start the cron job on server start
    startCronJob();
    setupGoogleCloudCredentials();
    return [];
  },
  webpack: (config) => {
    // Add the alias for "@/..."
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  }
  /* other config options here */
};

export default nextConfig;

