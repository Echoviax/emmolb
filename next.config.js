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
    BUILD_ID: '9',
  },
}

module.exports = nextConfig