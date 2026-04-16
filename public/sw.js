// Minimal, safe Service Worker for Next.js App Router
const OLD_CACHE_NAME = "ai-suite-cache-v1"; // The cache that broke routing

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Clear the broken cache from previous version
    event.waitUntil(
        caches.delete(OLD_CACHE_NAME).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Empty fetch handler to satisfy PWA install requirements
    // We intentionally let the browser and Next.js handle all network requests natively
    // to avoid breaking Next.js App Router RSC client-side navigations.
    return;
});
