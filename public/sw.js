// UNBREAKABLE Service Worker — network-first with asset caching + offline fallback + push notifications
const CACHE_NAME = 'unbreakable-v4';
const STATIC_CACHE = 'unbreakable-static-v2';

// Static assets to pre-cache on install
const PRE_CACHE = ['/'];

// Cache-first patterns (static assets that rarely change)
const CACHEABLE = /\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|webp|svg|ico|gif)(\?.*)?$/;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests (except CDN assets)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('cdn')) return;

  // Skip Supabase API calls — always go to network
  if (url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/') ||
      url.hostname.includes('supabase')) return;

  // Navigation requests (page loads) — network-first, fallback to cached shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Static assets — network-first for hashed JS/CSS (prevents stale chunk errors after deploy)
  if (CACHEABLE.test(url.pathname)) {
    e.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
});

// ━━━ Push Notifications ━━━
self.addEventListener('push', (e) => {
  let data = { title: 'UNBREAKABLE', body: 'You have a new notification', url: '/', icon: '/icons/icon-192x192.png' };
  try {
    if (e.data) {
      const payload = e.data.json();
      data = { ...data, ...payload };
    }
  } catch {
    // Use defaults
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
      tag: data.tag || 'unbreakable-notification',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
