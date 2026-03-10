/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ],
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
