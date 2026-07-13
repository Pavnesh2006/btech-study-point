import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  ...(isNetlify ? {} : { output: "standalone" }),
  experimental: { serverActions: { bodySizeLimit: "5GB" } },
  httpServerOptions: { requestTimeout: 0 },
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
