/* Xyvot Shop service worker — offline support + image caching.
 *
 * Strategy:
 * - App shell (/, /search): network-first, fall back to cache, then offline page.
 * - Images (product photos, icons): stale-while-revalidate.
 * - API calls (/api/*): network-only (never serve stale orders/cart data).
 * - Everything else: network-first with cache fallback.
 */

const VERSION = "xyvot-shop-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const IMAGE_CACHE = `${VERSION}-images`;
const OFFLINE_URL = "/offline";

const SHELL_URLS = ["/", "/search", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // never block install on cache failure
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("xyvot-shop-") && k !== SHELL_CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isImageRequest(request) {
  if (request.destination === "image") return true;
  return /\.(png|jpe?g|webp|avif|gif|svg|ico)$/i.test(new URL(request.url).pathname);
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Cross-origin images (e.g. Supabase storage): stale-while-revalidate.
    if (isImageRequest(request)) {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    }
    return;
  }

  // API: always network (never stale shop data).
  if (isApiRequest(url)) return;

  // Same-origin images: stale-while-revalidate.
  if (isImageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // Navigations & the rest: network-first, cache fallback, then offline page.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) =>
            cached ||
            (request.mode === "navigate"
              ? caches.match(OFFLINE_URL)
              : Promise.reject(new Error("offline")))
        )
      )
  );
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}
