import * as Sentry from '@sentry/nextjs'

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: sentryDsn || undefined,
  enabled: process.env.NODE_ENV === 'production' && Boolean(sentryDsn),
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  beforeSend(event, hint) {
    const error = hint?.originalException

    if (error instanceof Error) {
      const msg = error.message

      if (msg.includes('API Error: 4')) return null
      if (msg === 'Failed to fetch') return null
      if (msg.includes('NetworkError')) return null
      if (msg.includes('Load failed')) return null
      if (msg.includes('AbortError')) return null
    }

    return event
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
