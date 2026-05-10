const CACHE_NAME = "first-base-lab-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/fratto-icon-180.png",
  "/fratto-icon-192.png",
  "/fratto-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name);
        return undefined;
      })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!event.request.url.startsWith(self.location.origin)) return response;

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => {
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/index.html");
        }
        return undefined;
      });
    })
  );
});
