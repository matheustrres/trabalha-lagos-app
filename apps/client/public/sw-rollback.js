/* global caches, self */

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('tl-pwa-'))
            .map((name) => caches.delete(name)),
        ),
      ),
      self.registration.unregister(),
    ]).then(() => self.clients.matchAll()).then((clients) => {
      for (const client of clients) client.navigate(client.url)
    }),
  )
})
