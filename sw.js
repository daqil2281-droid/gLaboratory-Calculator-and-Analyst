/* gLab PWA service worker */
const CACHE_VERSION = 'glab-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(APP_SHELL);
    // Best-effort caching of CDN libraries for offline use; failures do not block installation.
    await Promise.all(CDN_ASSETS.map(async url => {
      try {
        const response = await fetch(url, {mode: 'no-cors'});
        if (response && (response.ok || response.type === 'opaque')) {
          await cache.put(url, response);
        }
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('glab-pwa-') && key !== CACHE_VERSION)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // App shell: cache-first so the app opens without a network connection after first visit.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        if (request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline and this resource is not cached.', {
          status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
        });
      }
    })());
    return;
  }

  // CDN dependencies are cache-first once stored; use the network when online.
  if (CDN_ASSETS.some(asset => request.url.startsWith(asset))) {
    event.respondWith((async () => {
      const cached = await caches.match(request.url);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === 'opaque')) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request.url, response.clone());
        }
        return response;
      } catch (_) {
        return new Response('Library unavailable offline. Reopen gLab while online once to cache it.', {
          status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
        });
      }
    })());
  }
});
