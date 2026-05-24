/** @type {import('next').NextConfig} */

const nextConfig = {
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
   * so that cookies are always same-origin (localhost:3022) from the
   * browser's perspective.
   */
};

export default nextConfig;
