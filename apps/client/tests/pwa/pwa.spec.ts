import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')

const readPngDimensions = async (filePath: string) => {
  const image = await readFile(filePath)
  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  }
}

const waitForServiceWorker = async (page: Page) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)
}

test('manifesto, ícones e headers do worker são válidos', async ({ request }) => {
  const manifestResponse = await request.get('/manifest.json')
  expect(manifestResponse.ok()).toBe(true)

  const manifest = (await manifestResponse.json()) as {
    id: string
    scope: string
    lang: string
    orientation?: string
    shortcuts: Array<{ url: string }>
    icons: Array<{ src: string; sizes: string; purpose?: string }>
  }

  expect(manifest).toMatchObject({ id: '/', scope: '/', lang: 'pt-BR' })
  expect(manifest.orientation).toBeUndefined()
  expect(manifest.shortcuts).toContainEqual(expect.objectContaining({ url: '/vagas' }))
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192' }),
      expect.objectContaining({ sizes: '512x512' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    ]),
  )

  await expect(readPngDimensions(path.join(PUBLIC_DIR, 'icons/icon-192.png')))
    .resolves.toEqual({ width: 192, height: 192 })
  await expect(readPngDimensions(path.join(PUBLIC_DIR, 'icons/icon-512.png')))
    .resolves.toEqual({ width: 512, height: 512 })
  await expect(readPngDimensions(path.join(PUBLIC_DIR, 'icons/icon-maskable-512.png')))
    .resolves.toEqual({ width: 512, height: 512 })
  await expect(readPngDimensions(path.join(PUBLIC_DIR, 'apple-touch-icon.png')))
    .resolves.toEqual({ width: 180, height: 180 })

  const workerResponse = await request.get('/sw.js')
  expect(workerResponse.headers()['cache-control']).toBe(
    'no-cache, no-store, must-revalidate',
  )
  expect(workerResponse.headers()['content-type']).toContain(
    'application/javascript',
  )
  expect(workerResponse.headers()['content-security-policy']).toContain(
    "default-src 'none'",
  )
})

test('registra e controla a aplicação após recarregar', async ({ page }) => {
  await waitForServiceWorker(page)
})

test('abre página pública visitada offline', async ({ page, context }) => {
  await waitForServiceWorker(page)
  await page.goto('/vagas/cabo-frio')
  await expect(page.getByRole('heading', { name: 'Cabo Frio' })).toBeVisible()

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Cabo Frio' })).toBeVisible()
})

test('usa o fallback para rota pública não armazenada', async ({ page, context }) => {
  await waitForServiceWorker(page)
  await context.setOffline(true)
  await page.goto('/vagas/rota-pwa-nao-visitada')
  await expect(
    page.getByRole('heading', { name: 'Você está sem conexão' }),
  ).toBeVisible()
})

test('não armazena autenticação, perfil ou painel', async ({ page }) => {
  await waitForServiceWorker(page)

  for (const route of ['/login', '/cadastro', '/perfil', '/painel']) {
    await page.goto(route)
  }

  const cachedUrls = await page.evaluate(async () => {
    const urls: string[] = []
    for (const cacheName of await caches.keys()) {
      const cache = await caches.open(cacheName)
      urls.push(...(await cache.keys()).map((request) => request.url))
    }
    return urls
  })

  expect(cachedUrls.some((url) => /\/(login|cadastro|perfil|painel)(\/|$)/.test(new URL(url).pathname))).toBe(false)
  expect(cachedUrls.some((url) => new URL(url).pathname.startsWith('/api/'))).toBe(false)
})

test('convite instala, respeita dispensa e some após appinstalled', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')

  await expect
    .poll(() =>
      page.evaluate(() => {
        const installEvent = new Event('beforeinstallprompt', {
          cancelable: true,
        })
        Object.defineProperties(installEvent, {
          prompt: { value: async () => undefined },
          userChoice: {
            value: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
          },
        })
        window.dispatchEvent(installEvent)
        return installEvent.defaultPrevented
      }),
    )
    .toBe(true)
  await page.clock.fastForward(30_000)

  const prompt = page.getByLabel('Instalar TrabalhaLagos')
  await expect(prompt).toBeVisible()
  await prompt.getByRole('button', { name: 'Agora não' }).click()
  await expect(prompt).toBeHidden()

  await page.reload()
  await page.clock.fastForward(30_000)
  await expect(prompt).toBeHidden()

  await page.evaluate(() => {
    localStorage.removeItem('tl:pwa-install-dismissed-at')
    window.dispatchEvent(new Event('appinstalled'))
  })
  expect(await page.evaluate(() => localStorage.getItem('tl:pwa-installed'))).toBe('true')
  await expect(prompt).toBeHidden()
})

test('atualização mostra aviso e ativa SKIP_WAITING', async ({ page }) => {
  await waitForServiceWorker(page)

  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js?e2e-update=1', { scope: '/' })
  })

  const updateButton = page.getByRole('button', { name: 'Atualizar' })
  await expect(updateButton).toBeVisible({ timeout: 15_000 })
  await Promise.all([page.waitForEvent('load'), updateButton.click()])
  await expect(page).toHaveURL('/')
})

test('flags ficam desabilitadas por padrão', async () => {
  const [localExample, productionExample, provider] = await Promise.all([
    readFile(path.resolve(process.cwd(), '.env.example'), 'utf8'),
    readFile(path.resolve(process.cwd(), '.env.production.example'), 'utf8'),
    readFile(
      path.resolve(process.cwd(), 'src/components/providers/pwa-provider.tsx'),
      'utf8',
    ),
  ])

  expect(localExample).toContain('NEXT_PUBLIC_PWA_ENABLED=false')
  expect(productionExample).toContain('NEXT_PUBLIC_PWA_ENABLED=false')
  expect(provider).toContain("process.env.NEXT_PUBLIC_PWA_ENABLED === 'true'")
})
