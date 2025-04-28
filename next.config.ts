import type { NextConfig } from "next";
import path from "path";
import { setupGoogleCloudCredentials } from "@/lib/google_storage/google_storage";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add the alias for "@/..."
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
      '@styles': path.resolve(__dirname, "lib/classNames.js")
    }
    return config;
  },
  env: {
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION,
  }
  /* other config options here */
};

export default withNextIntl(nextConfig);

