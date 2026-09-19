/* global caches, self */

const CACHE_VERSION = 'v1'
const PRECACHE = `tl-pwa-precache-${CACHE_VERSION}`
const STATIC_CACHE = `tl-pwa-static-${CACHE_VERSION}`
const PAGE_CACHE = `tl-pwa-pages-${CACHE_VERSION}`
const OWN_CACHES = [PRECACHE, STATIC_CACHE, PAGE_CACHE]
const PRECACHE_URLS = [
  '/offline',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
]

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
  /^\/vaga\/[^/]+\/?$/.test(pathname) ||
  /^\/vagas\/[^/]+\/?$/.test(pathname)

const isStaticAsset = (pathname) =>
  pathname.startsWith('/_next/static/') || pathname.startsWith('/icons/')

const offlineResponse = async () => {
  const cache = await caches.open(PRECACHE)
  return cache.match('/offline')
}

const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
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
    return (await cache.match(request)) || (await offlineResponse())
  }
}

const networkWithOfflineFallback = async (request) => {
  try {
    return await fetch(request)
  } catch {
    return offlineResponse()
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
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

  if (isPublicCacheablePage(url.pathname)) {
    event.respondWith(networkFirstPage(request))
    return
  }

  if (url.pathname === '/vagas') {
    event.respondWith(networkWithOfflineFallback(request))
  }
})
