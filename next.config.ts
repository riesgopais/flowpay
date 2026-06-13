import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@hashgraph/sdk', '@lifi/composer-sdk', '@lifi/compose-spec'],
};

export default nextConfig;
