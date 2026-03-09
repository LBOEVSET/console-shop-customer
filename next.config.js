/** @type {import('next').NextConfig} */
import dotenv from "dotenv";
dotenv.config();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ],
  },
  experimental: {
    serverActions: true
  },
  //!REMOVE LATER
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_API_URL}/api/:path*` // backend service
      }
    ]
  }
};

export default nextConfig;
