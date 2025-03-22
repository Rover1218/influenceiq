// Simple service worker to prevent 404 errors

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    // Pass through all requests
    event.respondWith(fetch(event.request));
});
