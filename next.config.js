/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/game/:path*',
        destination: '/watch/:path*',
        permanent: true,
      },
    ]
  },
  env: {
    BUILD_ID: '8',
  },
}

module.exports = nextConfig