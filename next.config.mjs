import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // output: 'standalone', // Linux sunucuda deploy ederken aktif edin (Windows'ta symlink izni gerektirir)
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default withNextIntl(nextConfig)
