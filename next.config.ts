import type { NextConfig } from "next";
import path from "path";
import { setupGoogleCloudCredentials } from "@/lib/google_storage/google_storage";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add the alias for "@/..."
    config.resolve.alias['@'] = path.resolve(__dirname);

    return config;
  }
  /* other config options here */
};

export default withNextIntl(nextConfig);

