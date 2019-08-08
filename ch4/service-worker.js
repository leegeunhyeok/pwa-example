/**
 * Service Worker
 */

const _version = 'v4';
const cacheName = 'v2';
const cacheList = [
  '/',
  '/manifest.json',
  '/scripts/app.js',
  '/styles/index.css',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg'
];

const log = msg => {
  console.log(`[ServiceWorker ${_version}] ${msg}`);
}

// Life cycle: INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  log('INSTALL');
  caches.open(cacheName).then(cache => {
    log('Caching app shell');
    return cache.addAll(cacheList);
  })
});

// Life cycle: ACTIVATE
self.addEventListener('activate', event => {
  log('Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheName) {
          log('Removing old cache ' + key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Functional: FETCH
self.addEventListener('fetch', event => {
  log('Fetch ' + event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
