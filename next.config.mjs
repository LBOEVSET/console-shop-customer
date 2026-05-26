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
  /**
   * API proxying is handled by the App Router Route Handler at
   * src/app/api/v1/[...path]/route.ts — no rewrites needed here.
   *
   * The Route Handler proxies all /api/v1/* requests to the NestJS backend
   * so that cookies are always same-origin from the browser's perspective.
   * In production, INTERNAL_API_URL env var points to the in-cluster service.
   */
};

export default nextConfig;
