import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/pwa',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-pwa',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm exec next start -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_PWA_ENABLED: 'true',
      NEXT_PUBLIC_PWA_INSTALL_PROMPT_ENABLED: 'true',
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3999/api/v1',
      API_URL: 'http://127.0.0.1:3999/api/v1',
    },
  },
})
