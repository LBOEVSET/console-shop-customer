/** @type {import('next').NextConfig} */
import https from "https"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const nextConfig = {
  images: {
    domains: ["mediam.dotlife.store"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ],
  },
  experimental: {
    serverActions: true
  }
};

export default nextConfig;
