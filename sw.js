// Portugal Camper-Tour — Service Worker
// Strategie:
// - App-Shell (HTML/CSS/JS/Icons/Daten): Cache-first, damit die App auch ohne Netz startet
// - Kartenkacheln (OpenStreetMap) & CDN-Bibliotheken: Cache, sobald einmal geladen (stale-while-revalidate)
// - Wetter-API (Open-Meteo): Network-first mit Cache-Fallback (das eigentliche Caching der
//   Wetterdaten übernimmt zusätzlich app.js selbst über localStorage, damit auch der Zeitstempel sichtbar ist)

const CACHE_VERSION = "ptcamper-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data/data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isMapTile(url) {
  return /tile\.openstreetmap\.org/.test(url) || /unpkg\.com\/leaflet/.test(url) || /fonts\.googleapis|fonts\.gstatic/.test(url);
}
function isWeatherApi(url) {
  return /api\.open-meteo\.com/.test(url);
}
function isRoutingApi(url) {
  return /router\.project-osrm\.org/.test(url);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = req.url;

  // Routing: immer frisch vom Netz, kein Sinn im Caching einzelner Routen
  if (isRoutingApi(url)) {
    event.respondWith(fetch(req));
    return;
  }

  // Wetter: erst Netz versuchen, sonst Cache
  if (isWeatherApi(url)) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Kartenkacheln & CDN: Cache-first, im Hintergrund aktualisieren
  if (isMapTile(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          caches.open(CACHE_VERSION).then((c) => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // App-Shell: Cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && req.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
