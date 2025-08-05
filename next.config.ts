import type { NextConfig } from "next";
const nextBuildId = require('next-build-id');
const buildId = nextBuildId.sync({ dir: __dirname });

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
  generateBuildId: () => buildId,
  env: {
    BUILD_ID: buildId,
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
