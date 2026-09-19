/* global caches, self */

const CACHE_VERSION = 'v3'
const PRECACHE = `tl-pwa-precache-${CACHE_VERSION}`
const STATIC_CACHE = `tl-pwa-static-${CACHE_VERSION}`
const PAGE_CACHE = `tl-pwa-pages-${CACHE_VERSION}`
const OWN_CACHES = [PRECACHE, STATIC_CACHE, PAGE_CACHE]
const PRECACHE_URLS = [
  '/offline',
  '/vagas',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
]

const precacheAppShells = async () => {
  const cache = await caches.open(PRECACHE)
  await cache.addAll(PRECACHE_URLS)

  const shellPages = await Promise.all(
    ['/offline', '/vagas'].map((url) => cache.match(url)),
  )
  const shellHtml = await Promise.all(
    shellPages.filter(Boolean).map((response) => response.text()),
  )
  const assetUrls = shellHtml.flatMap((html) =>
    [
      ...html.matchAll(/(?:src|href)="([^"?#]*\/_next\/static\/[^"?#]+)"/g),
    ].map((match) => match[1]),
  )

  await cache.addAll([...new Set(assetUrls)])
}

const AUTHENTICATED_PATHS = [
  '/login',
  '/cadastro',
  '/perfil',
  '/painel',
]

const isAuthenticatedPath = (pathname) =>
  AUTHENTICATED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

const isPublicCacheablePage = (pathname) =>
  pathname === '/' ||
  pathname === '/vagas' ||
  /^\/vaga\/[^/]+\/?$/.test(pathname) ||
  /^\/vagas\/[^/]+\/?$/.test(pathname)

const isStaticAsset = (pathname) =>
  pathname.startsWith('/_next/static/') || pathname.startsWith('/icons/')

const offlineResponse = async () => {
  const cache = await caches.open(PRECACHE)
  return cache.match('/offline')
}

const offlineRedirect = () =>
  Response.redirect(new URL('/offline', self.location.origin).href, 302)

const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) await cache.put(request, response.clone())
  return response
}

const networkFirstPage = async (request) => {
  const cache = await caches.open(PAGE_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    return (
      (await cache.match(request)) ||
      (new URL(request.url).pathname === '/vagas'
        ? await caches.match('/vagas')
        : null) ||
      offlineRedirect()
    )
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShells())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('tl-pwa-') && !OWN_CACHES.includes(name))
            .map((name) => caches.delete(name)),
        ),
      ),
      self.clients.claim(),
    ]),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || request.headers.has('Authorization')) return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || isAuthenticatedPath(url.pathname)) return

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (request.mode !== 'navigate') return

  if (url.pathname === '/offline') {
    event.respondWith(offlineResponse())
    return
  }

  if (isPublicCacheablePage(url.pathname)) {
    event.respondWith(networkFirstPage(request))
    return
  }
})
