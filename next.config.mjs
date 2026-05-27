/** @type {import('next').NextConfig} */

const nextConfig = {
  // Standalone output for GKE — produces a minimal self-contained server
  // in .next/standalone without shipping the full node_modules tree.
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
