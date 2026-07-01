// Portugal Camper-Tour — Service Worker
// Strategie:
// - App-Shell (HTML/CSS/JS/Icons/Daten/Leaflet): stale-while-revalidate – die App startet
//   sofort aus dem Cache (auch offline) und lädt im Hintergrund die neueste Version nach.
//   Kommt dabei geänderter Inhalt an, wird die App informiert und zeigt ein Update-Banner.
// - Kartenkacheln (OpenStreetMap) & Fonts: Cache, sobald einmal geladen
// - Wetter-API (Open-Meteo): Network-first mit Cache-Fallback (das eigentliche Caching der
//   Wetterdaten übernimmt zusätzlich app.js selbst über localStorage, damit auch der Zeitstempel sichtbar ist)

const CACHE_VERSION = "ptcamper-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data/data.js",
  "./manifest.json",
  "./vendor/leaflet/leaflet.js",
  "./vendor/leaflet/leaflet.css",
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
  return /tile\.openstreetmap\.org/.test(url) || /fonts\.googleapis|fonts\.gstatic/.test(url);
}
function isWeatherApi(url) {
  return /api\.open-meteo\.com/.test(url);
}
function isRoutingApi(url) {
  return /router\.project-osrm\.org/.test(url);
}

// Meldet allen offenen App-Fenstern, dass neue Inhalte im Cache liegen
async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((c) => c.postMessage({ type: "content-updated" }));
}

// Vergleicht Cache- und Netzwerkantwort über Header, um unnötige Update-Banner zu vermeiden
function responseChanged(cached, fresh) {
  if (!cached) return false;
  const keys = ["etag", "last-modified", "content-length"];
  let comparable = false;
  for (const k of keys) {
    const a = cached.headers.get(k), b = fresh.headers.get(k);
    if (a && b) {
      comparable = true;
      if (a !== b) return true;
    }
  }
  // Ohne vergleichbare Header lieber kein Banner zeigen als ständig falschen Alarm
  return comparable ? false : false;
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

  // Kartenkacheln & Fonts: Cache-first, im Hintergrund aktualisieren
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

  // App-Shell (gleiche Origin): stale-while-revalidate.
  // Sofortige Antwort aus dem Cache, Hintergrund-Update vom Netz –
  // bei geändertem Inhalt bekommt die App eine Nachricht (Update-Banner).
  if (req.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then(async (c) => {
              if (cached && responseChanged(cached, res)) notifyClientsOfUpdate();
              await c.put(req, clone);
            });
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Übrige externe Ressourcen: Netz mit Cache-Fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
