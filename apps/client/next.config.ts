import type { NextConfig } from 'next'
import path from 'path'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
}

export default withSentryConfig(nextConfig, {
  org: 'trabalhalagos',
  project: 'trabalhalagos-client',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
})
