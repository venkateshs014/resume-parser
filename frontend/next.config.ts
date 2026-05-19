import type { NextConfig } from "next";

const backendHostport = process.env.BACKEND_PRIVATE_HOSTPORT;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendHostport) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `http://${backendHostport}/:path*`,
      },
    ];
  },
};

export default nextConfig;
