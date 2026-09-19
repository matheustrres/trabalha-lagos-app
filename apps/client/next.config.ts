import type { NextConfig } from 'next'
import path from 'path'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; script-src 'self'; connect-src 'self'",
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'trabalhalagos',
  project: 'trabalhalagos-client',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
})
