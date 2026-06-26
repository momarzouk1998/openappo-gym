/* OpenGym Service Worker — advanced PWA
 * Strategies:
 *   - App shell (HTML/JS/CSS): stale-while-revalidate
 *   - Static assets (images/fonts): cache-first
 *   - API (GET): network-first with offline fallback
 *   - API (POST/PUT/DELETE): network with background sync queue
 */
const SW_VERSION = 'v1.0.0';
const STATIC_CACHE = `opengym-static-${SW_VERSION}`;
const RUNTIME_CACHE = `opengym-runtime-${SW_VERSION}`;
const APP_SHELL = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Background sync queue for failed mutations
const SYNC_QUEUE = 'opengym-sync-queue';
let syncDB = null;

// ---- IndexedDB for sync queue ----
function openSyncDB() {
  return new Promise((resolve, reject) => {
    if (syncDB) return resolve(syncDB);
    const req = indexedDB.open('opengym-sw', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => {
      syncDB = req.result;
      resolve(syncDB);
    };
    req.onerror = () => reject(req.error);
  });
}

async function addToQueue(request) {
  const body = await request.clone().text();
  const entry = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body,
    timestamp: Date.now(),
  };
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue', 'readwrite');
    tx.objectStore('queue').add(entry);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function getQueue() {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue', 'readonly');
    const req = tx.objectStore('queue').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function removeFromQueue(id) {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue', 'readwrite');
    tx.objectStore('queue').delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// ---- Install: pre-cache app shell ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---- Helper: cache strategies ----
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Offline fallback page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    throw err;
  }
}

// ---- Fetch handler ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET for static assets, cross-origin, chrome-extension
  if (url.origin !== self.location.origin) return;

  // Navigation requests → network-first (with offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // API requests
  if (url.pathname.startsWith('/api/')) {
    // Non-GET mutations → queue for background sync
    if (request.method !== 'GET') {
      event.respondWith(
        (async () => {
          try {
            return await fetch(request);
          } catch (err) {
            await addToQueue(request);
            await self.registration.sync.register(SYNC_QUEUE);
            return new Response(
              JSON.stringify({
                error: 'أنت غير متصل — سيتم المزامنة عند عودة الاتصال',
                queued: true,
              }),
              {
                status: 202,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        })()
      );
      return;
    }
    // GET API → network-first
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (images, fonts, svg, png) → cache-first
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|ttf)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: stale-while-revalidate (JS, CSS, etc.)
  if (request.method === 'GET') {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ---- Background sync: replay queued mutations ----
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_QUEUE) {
    event.waitUntil(replayQueue());
  }
});

async function replayQueue() {
  const queue = await getQueue();
  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (response.ok) {
        await removeFromQueue(item.id);
      }
    } catch (err) {
      // Will retry on next sync
      break;
    }
  }
}

// ---- Periodic sync: refresh data caches ----
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'opengym-refresh') {
    event.waitUntil(refreshCaches());
  }
});

async function refreshCaches() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  await Promise.allSettled(
    keys.map((req) =>
      fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
      })
    )
  );
}

// ---- Push notifications ----
self.addEventListener('push', (event) => {
  let data = { title: 'OpenGym', body: 'إشعار جديد' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/maskable-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard' },
    dir: 'rtl',
    lang: 'ar',
    requireInteraction: data.urgent || false,
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ---- Notification click ----
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new tab
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ---- Message handler (for skipWaiting from page) ----
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
