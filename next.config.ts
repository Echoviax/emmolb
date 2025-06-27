import type { NextConfig } from "next";

module.exports = {
  async redirects() {
    return [
      {
        source: '/game/:path*', // match /game and any sub-paths
        destination: '/watch/:path*', // redirect to /watch preserving the path
        permanent: true, // 301 redirect
      },
    ]
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
