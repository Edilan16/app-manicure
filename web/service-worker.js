// Service Worker para auto-atualização do PWA
const CACHE_NAME = 'app-manicure-v1';
const RUNTIME_CACHE = 'runtime';

// Arquivos para cachear na instalação
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições (Network First para HTML, Cache First para assets)
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ignorar requisições do Firebase
  if (event.request.url.includes('firebase') || event.request.url.includes('firestore')) {
    return;
  }

  // Network First para HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache First para outros recursos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

// Detectar atualizações e forçar reload
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
