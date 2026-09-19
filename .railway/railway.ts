import {
  defineRailway,
  github,
  preserve,
  project,
  service,
} from 'railway/iac'

export const partial = 'trabalha-lagos-api'

export default defineRailway(() => {
  const api = service('@trabalha-lagos/api', {
    source: github('matheustrres/trabalha-lagos-app'),
    build: {
      builder: 'RAILPACK',
      buildCommand: 'pnpm --filter @trabalha-lagos/api build',
      watchPatterns: ['/apps/api/**'],
    },
    deploy: {
      preDeployCommand: [
        'pnpm --filter @trabalha-lagos/api db:migrate:prod',
      ],
      startCommand: 'pnpm --filter @trabalha-lagos/api start:prod',
      healthcheckPath: '/api/v1/health',
      healthcheckTimeout: 120,
      sleepApplication: false,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 5,
    },
    variables: {
      CORS_ORIGINS: preserve(),
      DATABASE_URL: preserve(),
      JWT_EXPIRES_IN: preserve(),
      JWT_REFRESH_EXPIRES_IN: preserve(),
      JWT_REFRESH_SECRET: preserve(),
      JWT_SECRET: preserve(),
      NODE_ENV: preserve(),
      PG_DATABASE: preserve(),
      PG_HOST: preserve(),
      PG_PASSWORD: preserve(),
      PG_PORT: preserve(),
      PG_USER: preserve(),
      PORT: preserve(),
      REDIS_HOST: preserve(),
      REDIS_PASSWORD: preserve(),
      REDIS_PORT: preserve(),
      THROTTLE_ENABLED: preserve(),
      VIEW_COUNTER_FLUSH_CRON: preserve(),
    },
  })

  return project('easygoing-freedom', {
    resources: [api],
  })
})
