// Service Worker pro Knihovna Emi PWA
// Zajišťuje offline funkčnost a umožňuje instalaci na plochu

const CACHE_NAME = 'knihovna-emi-v1';
const BASE_URL = '/Knihovna-Emi';

// Soubory k předběžnému cachování při instalaci SW
const PRE_CACHE = [
  BASE_URL + '/',
  BASE_URL + '/index.html',
  BASE_URL + '/assets/manifest.json',
  BASE_URL + '/assets/icon-192.png',
  BASE_URL + '/assets/icon-512.png',
];

// Instalace – předcachování statických assetů
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE).catch(() => {
        // Pokud některý soubor chybí, instalace přesto proběhne
      });
    })
  );
  self.skipWaiting();
});

// Aktivace – smazání starých verzí cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch – strategie: network first, fallback na cache
self.addEventListener('fetch', (event) => {
  // Ignorovat non-GET requesty
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cachovat úspěšné odpovědi
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline – vrátit z cache
        return caches.match(event.request).then(
          (cached) => cached || caches.match(BASE_URL + '/index.html')
        );
      })
  );
});
