import * as Sentry from '@sentry/nextjs'

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: sentryDsn || undefined,
  enabled: process.env.NODE_ENV === 'production' && Boolean(sentryDsn),
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
})
