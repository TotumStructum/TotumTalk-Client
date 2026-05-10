/* eslint-disable no-restricted-globals */
/* global self, caches */

const CACHE_NAME = "totumtalk-pwa-shell-v1";

const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/logo192.png",
  "/logo512.png",
  "/apple-touch-icon.png",
  "/maskable-icon-192.png",
  "/maskable-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches
          .match("/index.html")
          .then((response) => response || caches.match("/")),
      ),
    );
  }
});
