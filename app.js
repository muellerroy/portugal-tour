/* =========================================================
   Portugal Camper-Tour — App-Logik (vanilla JS, kein Build-Schritt)
   ========================================================= */

const STORAGE_KEY = "pt_camper_user_data_v1";
const WEATHER_CACHE_PREFIX = "pt_camper_weather_";
const WEATHER_TTL_MS = 3 * 60 * 60 * 1000; // 3 Stunden

const CATEGORY_LABEL = { natur: "Natur", genuss: "Genuss", kultur: "Kultur", camping: "Camping/Stellplatz" };
const CATEGORY_ICON = { natur: "🌿", genuss: "🍷", kultur: "🏛️", camping: "🚐" };

// ---------- State ----------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("State konnte nicht geladen werden", e); }
  return { startDate: null, currentRegionId: TRIP_DATA.regions[0].id, entries: {}, customSpots: [] };
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Speichern fehlgeschlagen", e);
    showToast("⚠️ Speicher voll – Änderung nicht gesichert. Exportiere deine Daten und lösche ggf. alte Fotos.", 4200);
  }
}
let state = loadState();

// ---------- Kleine Helfer ----------
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

let _toastTimer = null;
function showToast(msg, duration = 1800) {
  document.querySelectorAll(".app-toast").forEach(t => t.remove());
  clearTimeout(_toastTimer);
  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.setAttribute("role", "status");
  toast.textContent = msg;
  document.body.appendChild(toast);
  _toastTimer = setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

// Bittet den Browser, die lokalen Daten nicht automatisch zu löschen (wichtig auf iOS)
function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
}

// Wetter-Caches älter als 7 Tage entfernen, damit sie nicht mit Fotos um Speicher konkurrieren
function cleanupWeatherCache() {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(WEATHER_CACHE_PREFIX))
      .forEach(k => {
        try {
          const v = JSON.parse(localStorage.getItem(k) || "null");
          if (!v || !v.fetchedAt || v.fetchedAt < cutoff) localStorage.removeItem(k);
        } catch (e) { localStorage.removeItem(k); }
      });
  } catch (e) {}
}

function getEntry(spotId) {
  if (!state.entries[spotId]) {
    state.entries[spotId] = { visited: false, skipped: false, rating: 0, note: "", photos: [], visitedAt: null };
  }
  return state.entries[spotId];
}

function allSpots() {
  const spots = [];
  TRIP_DATA.regions.forEach(r => r.spots.forEach(s => spots.push({ ...s, regionId: r.id, regionName: r.name })));
  return spots;
}

// ---------- Navigation ----------
const screens = ["home", "map", "regions", "journal", "settings"];
function showScreen(name) {
  screens.forEach(s => {
    document.getElementById("screen-" + s).classList.toggle("active", s === name);
    const tab = document.querySelector(`.tab[data-screen="${s}"]`);
    if (tab) tab.classList.toggle("active", s === name);
  });
  if (name === "map") setTimeout(() => {
    if (window._leafletMap) {
      window._leafletMap.invalidateSize();
      // fitBounds aus initMap lief, als der Screen noch unsichtbar war (Grösse 0)
      // und lieferte einen falschen Ausschnitt – hier mit echter Grösse nachholen
      if (!window._mapFitted && window._mapBounds) {
        window._leafletMap.fitBounds(window._mapBounds, { padding: [30, 30] });
        window._mapFitted = true;
      }
    }
  }, 60);
  if (name === "home") renderHome();
  if (name === "regions") renderRegions();
  if (name === "journal") renderJournal();
  if (name === "settings") renderSettings();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });
  initMap();
  showScreen("home");
  registerServiceWorker();
  watchOnlineStatus();
  requestPersistentStorage();
  cleanupWeatherCache();
  updateJournalBadge();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (document.querySelector(".lightbox")) closeLightbox();
      else if (document.getElementById("sheet").classList.contains("show")) closeSheet();
    }
  });
});

// Kleiner Zähler am Tagebuch-Tab: zeigt auf einen Blick, wie viele Einträge es gibt
function updateJournalBadge() {
  const tab = document.querySelector('.tab[data-screen="journal"]');
  if (!tab) return;
  const count = Object.values(state.entries)
    .filter(e => e.rating > 0 || e.note || (e.photos && e.photos.length)).length;
  let badge = tab.querySelector(".tab-badge");
  if (!count) { if (badge) badge.remove(); return; }
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "tab-badge";
    tab.appendChild(badge);
  }
  badge.textContent = count > 99 ? "99+" : count;
}

// ---------- HOME ----------
function totalDays() { return TRIP_DATA.totalDays; }

function renderHome() {
  const el = document.getElementById("screen-home");
  const regions = TRIP_DATA.regions;
  const currentIdx = regions.findIndex(r => r.id === state.currentRegionId);
  const current = regions[currentIdx] || regions[0];
  const next = regions[currentIdx + 1];

  let dayInfo = "";
  let progressPct = Math.round(((currentIdx + 1) / regions.length) * 100);
  if (state.startDate) {
    const start = new Date(state.startDate);
    const today = new Date();
    const diffDays = Math.floor((today - start) / 86400000) + 1;
    const clamped = Math.min(Math.max(diffDays, 1), totalDays());
    dayInfo = `<div class="day-count">${clamped}<span style="font-size:1.1rem; opacity:.7;"> / ${totalDays()}</span></div>
      <div class="day-label">Tag der Reise</div>`;
    progressPct = Math.round((clamped / totalDays()) * 100);
  } else {
    dayInfo = `<div class="day-count" style="font-size:1.6rem;">Startdatum fehlt</div>
      <div class="day-label">In den Einstellungen festlegen für den Tage-Zähler</div>`;
  }

  const visitedCount = Object.values(state.entries).filter(e => e.visited).length;
  const ratedCount = Object.values(state.entries).filter(e => e.rating > 0).length;

  el.innerHTML = `
    <div class="hero">
      ${dayInfo}
      <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      <div class="hero-stats">
        <span>${visitedCount} besucht</span>
        <span>·</span>
        <span>${ratedCount} bewertet</span>
      </div>
      <div class="current-region-pill">Aktuell: ${current.name}</div>
    </div>
    <div class="section-pad">
      <span class="eyebrow">Nächste Region</span>
      ${next ? regionMiniCard(next, currentIdx + 1) : `<div class="card">Das war die letzte Region – gute Heimreise! 🎉</div>`}
    </div>
    <div class="section-pad">
      <span class="eyebrow">Wo bist du gerade?</span>
      <div class="card">
        <p style="font-size:0.85rem; color:var(--ink-soft); margin:0 0 12px;">Setze deine aktuelle Region, damit Fortschritt und "nächste Etappe" stimmen. Du kannst jederzeit vor- oder zurückspringen.</p>
        <select id="current-region-select" style="width:100%; padding:12px; border-radius:10px; border:1px solid var(--line); font-size:0.9rem; font-family:inherit;">
          ${regions.map(r => `<option value="${r.id}" ${r.id === state.currentRegionId ? "selected" : ""}>${r.order}. ${r.name}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
  document.getElementById("current-region-select").addEventListener("change", (e) => {
    state.currentRegionId = e.target.value;
    saveState();
    renderHome();
  });
}

function regionMiniCard(region, index) {
  const spotCount = region.spots.length;
  return `
    <div class="card" style="cursor:pointer;" onclick="jumpToRegion('${region.id}')">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3>${region.order}. ${region.name}</h3>
          <p class="region-summary" style="margin:6px 0 0;">${region.summary}</p>
        </div>
        <div class="stamp">${region.timeframeDays}T</div>
      </div>
    </div>
  `;
}
function jumpToRegion(id) {
  showScreen("regions");
  setTimeout(() => {
    const card = document.querySelector(`.region-card[data-region="${id}"]`);
    if (card) { card.classList.add("open"); card.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }, 60);
}

// ---------- REGIONS ----------
let regionFilter = "all";
function renderRegions() {
  const el = document.getElementById("screen-regions");
  el.innerHTML = `
    <div class="section-pad">
      <div class="chip-row" id="region-filter-row">
        ${["all", "natur", "genuss", "kultur", "camping"].map(c => `
          <button class="chip ${regionFilter === c ? "active" : ""}" data-filter="${c}">
            ${c === "all" ? "Alle" : CATEGORY_ICON[c] + " " + CATEGORY_LABEL[c]}
          </button>`).join("")}
      </div>
    </div>
    <div class="section-pad" id="region-list"></div>
  `;
  document.querySelectorAll("#region-filter-row .chip").forEach(btn => {
    btn.addEventListener("click", () => { regionFilter = btn.dataset.filter; renderRegions(); });
  });
  const list = document.getElementById("region-list");
  list.innerHTML = TRIP_DATA.regions.map(r => regionCardHTML(r)).join("");
  list.querySelectorAll(".region-head").forEach(head => {
    head.addEventListener("click", () => head.closest(".region-card").classList.toggle("open"));
  });
  list.querySelectorAll("[data-spot]").forEach(row => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".row-btn")) return;
      openSpotSheet(row.dataset.spot);
    });
  });
  list.querySelectorAll(".row-btn.skip-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const entry = getEntry(btn.dataset.spot);
      entry.skipped = !entry.skipped;
      saveState();
      renderRegions();
    });
  });
}

function regionCardHTML(region) {
  const doneCount = region.spots.filter(s => getEntry(s.id).visited).length;
  const isCurrent = region.id === state.currentRegionId;
  const spots = region.spots.filter(s => regionFilter === "all" || s.category === regionFilter);
  return `
    <div class="region-card" data-region="${region.id}" style="${isCurrent ? "border-color:var(--accent);" : ""}">
      <div class="region-head">
        <div class="num mono">${String(region.order).padStart(2, "0")}</div>
        <div class="titles">
          <h3>${region.name}${isCurrent ? ' <span style="color:var(--accent);">●</span>' : ""}</h3>
          <div class="meta">${region.timeframeDays} Tage · ${doneCount}/${region.spots.length} besucht</div>
        </div>
        <div class="stamp ${doneCount === region.spots.length ? "done" : ""}">${doneCount}/${region.spots.length}</div>
        <div class="chevron">›</div>
      </div>
      <div class="region-body">
        <p class="region-summary">${region.summary}</p>
        ${spots.map(s => spotRowHTML(s)).join("") || `<p style="font-size:0.82rem; color:var(--ink-soft);">Keine Spots in dieser Kategorie.</p>`}
      </div>
    </div>
  `;
}

function spotRowHTML(spot) {
  const entry = getEntry(spot.id);
  return `
    <div class="spot-row ${entry.skipped ? "skipped" : ""}" data-spot="${spot.id}">
      <span class="cat-dot ${spot.category}"></span>
      <div class="info">
        <div class="name">${spot.name}</div>
        <div class="sub">${entry.visited ? "✓ besucht" : "noch offen"}${entry.rating ? " · " + "★".repeat(entry.rating) : ""}</div>
      </div>
      <button class="row-btn skip-btn" data-spot="${spot.id}" title="Überspringen/aktivieren">${entry.skipped ? "↺" : "⏭"}</button>
    </div>
  `;
}

// ---------- SPOT DETAIL SHEET ----------
function findSpot(spotId) {
  for (const r of TRIP_DATA.regions) {
    const s = r.spots.find(sp => sp.id === spotId);
    if (s) return { ...s, regionId: r.id, regionName: r.name };
  }
  return (state.customSpots || []).find(s => s.id === spotId);
}

function openSpotSheet(spotId) {
  const spot = findSpot(spotId);
  if (!spot) return;
  const entry = getEntry(spotId);
  const backdrop = document.getElementById("sheet-backdrop");
  const sheet = document.getElementById("sheet");

  // Scrollposition merken, falls das Sheet für denselben Spot neu gerendert wird
  // (z. B. nach Sternvergabe) – sonst springt die Ansicht störend nach oben
  const prevScroll = (sheet.dataset.spot === spotId && sheet.classList.contains("show"))
    ? (sheet.querySelector(".sheet-scroll")?.scrollTop || 0) : 0;
  sheet.dataset.spot = spotId;

  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-header">
        <div>
          <span class="badge ${spot.category}">${CATEGORY_ICON[spot.category]} ${CATEGORY_LABEL[spot.category]}</span>
          <h2 style="margin-top:8px;">${spot.name}</h2>
          <div style="font-size:0.78rem; color:var(--ink-soft); margin-top:2px;">${spot.regionName || ""}</div>
        </div>
        <button class="icon-btn" style="background:var(--cream-dim); color:var(--ink);" onclick="closeSheet()">✕</button>
      </div>

      <p style="font-size:0.92rem; line-height:1.5;">${spot.description || "Keine Beschreibung hinterlegt."}</p>

      <div class="coord-row mono">
        ${spot.lat?.toFixed(5)}, ${spot.lon?.toFixed(5)}
        <button class="btn ghost" style="min-height:32px; padding:6px 12px; font-size:0.72rem;" onclick="copyCoords(${spot.lat}, ${spot.lon})">Kopieren</button>
      </div>
      <div class="btn-row">
        <button class="btn primary" style="flex:1;" onclick="showRouteToSpot({id:'${spot.id}',name:'${(spot.name||"").replace(/'/g,"\\'")}',lat:${spot.lat},lon:${spot.lon}}); closeSheet();">Route berechnen</button>
        <a class="btn ghost" style="flex:1; text-decoration:none; text-align:center;" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}&travelmode=driving">Karten-App ↗</a>
      </div>
      <p class="weather-note" style="margin-top:6px;">"Route berechnen" zeigt Distanz & Fahrzeit direkt in der App (benötigt Standortfreigabe). Für gesprochene Turn-by-Turn-Navigation "Karten-App" nutzen (öffnet Google Maps).</p>

      <div class="detail-grid">
        <div class="detail-box"><div class="k">Kosten</div><div class="v">${spot.cost || "unbekannt"}</div></div>
        <div class="detail-box"><div class="k">Zufahrt</div><div class="v">${spot.access || "unbekannt"}</div></div>
        <div class="detail-box" style="grid-column: 1 / -1;"><div class="k">Ausstattung</div><div class="v">${spot.amenities || "unbekannt"}</div></div>
      </div>
      <span class="badge source-${spot.source === "enriched" ? "enriched" : "core"}">${spot.source === "enriched" ? "✨ von Claude ergänzt" : "📋 Kerndaten"}</span>

      <div style="margin-top:20px;">
        <span class="eyebrow">Wettervorhersage</span>
        <div class="weather-strip" id="weather-strip">
          <div style="padding:14px; font-size:0.82rem; color:var(--ink-soft);">Lade Wetterdaten…</div>
        </div>
        <div class="weather-note">Quelle: Open-Meteo · zuletzt aktualisiert: <span id="weather-updated">–</span></div>
      </div>

      <div style="margin-top:22px;">
        <span class="eyebrow">Deine Bewertung</span>
        <div class="rating-row" id="rating-row" role="radiogroup" aria-label="Bewertung in Sternen">
          ${[1,2,3,4,5].map(n => `<button class="star-btn ${entry.rating >= n ? "on" : ""}" data-star="${n}" aria-label="${n} von 5 Sternen" aria-pressed="${entry.rating >= n}">★</button>`).join("")}
        </div>
      </div>

      <div>
        <span class="eyebrow">Notiz</span>
        <textarea class="note-input" id="note-input" placeholder="Wie war's? Tipps für später, Wegbeschreibung, Eindrücke...">${escapeHtml(entry.note)}</textarea>
        <div class="save-hint" id="note-save-hint" aria-live="polite"></div>
      </div>

      <div>
        <span class="eyebrow">Fotos</span>
        <div class="photo-row" id="photo-row">
          ${(entry.photos || []).map((p, i) => `<button class="photo-thumb-btn" data-idx="${i}" aria-label="Foto ${i + 1} ansehen"><img class="photo-thumb" src="${p}" alt="Foto ${i + 1} zu ${escapeHtml(spot.name)}"></button>`).join("")}
          <button class="photo-add" id="photo-add-btn" aria-label="Foto hinzufügen">+</button>
          <input type="file" id="photo-input" accept="image/*" capture="environment" style="display:none;">
        </div>
        ${(entry.photos || []).length ? `<div class="weather-note">Foto antippen zum Vergrössern oder Löschen.</div>` : ""}
      </div>

      <div class="btn-row" style="margin-top:8px;">
        <button class="btn ${entry.visited ? "terracotta" : "primary"} block" id="visited-btn">${entry.visited ? "✓ Als besucht markiert" : "Als besucht markieren"}</button>
      </div>
      <div class="btn-row">
        <button class="btn ghost block" id="skip-toggle-btn">${entry.skipped ? "Wieder aktivieren" : "Diesen Spot überspringen"}</button>
      </div>
    </div>
  `;

  // Events
  sheet.querySelectorAll(".star-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      entry.rating = entry.rating === Number(btn.dataset.star) ? 0 : Number(btn.dataset.star);
      popAnimate(btn);
      saveState();
      updateJournalBadge();
      openSpotSheet(spotId);
    });
  });

  // Notiz: automatisch beim Tippen speichern (debounced), nicht erst beim Verlassen des Felds –
  // so geht nichts verloren, wenn das Sheet über den Hintergrund geschlossen wird
  let noteTimer = null;
  const noteInput = document.getElementById("note-input");
  const noteHint = document.getElementById("note-save-hint");
  noteInput.addEventListener("input", () => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      entry.note = noteInput.value;
      saveState();
      updateJournalBadge();
      if (noteHint) {
        noteHint.textContent = "✓ Gespeichert";
        setTimeout(() => { if (noteHint.textContent === "✓ Gespeichert") noteHint.textContent = ""; }, 1600);
      }
    }, 450);
  });
  noteInput.addEventListener("blur", () => {
    clearTimeout(noteTimer);
    entry.note = noteInput.value;
    saveState();
    updateJournalBadge();
  });

  document.getElementById("visited-btn").addEventListener("click", (e) => {
    const wasVisited = entry.visited;
    entry.visited = !entry.visited;
    entry.visitedAt = entry.visited ? new Date().toISOString() : null;
    saveState();
    if (!wasVisited && entry.visited) celebrate();
    popAnimate(e.currentTarget);
    openSpotSheet(spotId);
  });
  document.getElementById("skip-toggle-btn").addEventListener("click", () => {
    entry.skipped = !entry.skipped;
    saveState();
    openSpotSheet(spotId);
  });
  document.getElementById("photo-add-btn").addEventListener("click", () => document.getElementById("photo-input").click());
  document.getElementById("photo-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const addBtn = document.getElementById("photo-add-btn");
    if (addBtn) { addBtn.textContent = "…"; addBtn.disabled = true; }
    try {
      const compressed = await compressImage(file);
      entry.photos = entry.photos || [];
      entry.photos.push(compressed);
      saveState();
      updateJournalBadge();
      openSpotSheet(spotId);
    } catch (err) {
      console.warn("Foto konnte nicht verarbeitet werden", err);
      showToast("Foto konnte nicht hinzugefügt werden.");
      if (addBtn) { addBtn.textContent = "+"; addBtn.disabled = false; }
    }
  });
  sheet.querySelectorAll(".photo-thumb-btn").forEach(btn => {
    btn.addEventListener("click", () => openLightbox(spotId, Number(btn.dataset.idx)));
  });

  backdrop.classList.add("show");
  sheet.classList.add("show");
  document.body.style.overflow = "hidden";

  // Scrollposition wiederherstellen (bei Re-Render nach Stern/Besucht-Klick)
  if (prevScroll) {
    const scroller = sheet.querySelector(".sheet-scroll");
    if (scroller) scroller.scrollTop = prevScroll;
  }

  loadWeather(spot);
}

// ---------- Foto-Kompression ----------
// Verkleinert Fotos vor dem Speichern auf max. 1280 px Kantenlänge (JPEG, Qualität 0.72).
// Aus 4-8 MB Originalen werden so ~150-300 KB – ohne das läuft localStorage nach
// wenigen Fotos voll und Speichern schlägt fehl.
function compressImage(file, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Foto-Lightbox ----------
// Vorher löschte ein Tippen auf das Miniaturbild das Foto sofort und ohne Rückfrage.
// Jetzt: Tippen öffnet die Grossansicht, Löschen erst nach Bestätigung.
function openLightbox(spotId, idx) {
  const entry = getEntry(spotId);
  const photo = (entry.photos || [])[idx];
  if (!photo) return;
  closeLightbox();
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `
    <img src="${photo}" alt="Foto in Grossansicht">
    <div class="lightbox-bar">
      <button class="btn ghost" id="lightbox-delete">🗑 Löschen</button>
      <button class="btn primary" id="lightbox-close">Schliessen</button>
    </div>
  `;
  document.body.appendChild(box);
  box.addEventListener("click", (e) => { if (e.target === box) closeLightbox(); });
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-delete").addEventListener("click", () => {
    if (confirm("Dieses Foto wirklich löschen?")) {
      entry.photos.splice(idx, 1);
      saveState();
      updateJournalBadge();
      closeLightbox();
      openSpotSheet(spotId);
    }
  });
}
function closeLightbox() {
  document.querySelectorAll(".lightbox").forEach(b => b.remove());
}
function closeSheet() {
  document.getElementById("sheet-backdrop").classList.remove("show");
  document.getElementById("sheet").classList.remove("show");
  document.body.style.overflow = "";
  updateJournalBadge();
  renderRegions(); renderJournal(); renderHome();
}
function copyCoords(lat, lon) {
  const text = `${lat}, ${lon}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Koordinaten kopiert"))
      .catch(() => showToast("Kopieren nicht möglich – Koordinaten: " + text, 3200));
  } else {
    showToast("Kopieren nicht unterstützt – Koordinaten: " + text, 3200);
  }
}

// ---------- WEATHER (Open-Meteo, kein API-Key nötig) ----------
const WMO_ICON = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️"
};
function weatherIcon(code) { return WMO_ICON[code] || "🌡️"; }

async function loadWeather(spot) {
  const strip = document.getElementById("weather-strip");
  const updatedEl = document.getElementById("weather-updated");
  if (!strip) return;
  const cacheKey = WEATHER_CACHE_PREFIX + spot.id;

  function relativeAge(ts) {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 2) return "gerade eben";
    if (mins < 60) return `vor ${mins} Min.`;
    const h = Math.round(mins / 60);
    if (h < 24) return `vor ${h} Std.`;
    return `vor ${Math.round(h / 24)} Tagen`;
  }

  function render(data, fromCache, fetchedAt) {
    if (!data || !data.daily) {
      strip.innerHTML = `<div style="padding:14px; font-size:0.82rem; color:var(--ink-soft);">Wetterdaten nicht verfügbar${fromCache ? " (offline, kein Cache vorhanden)" : ""}.</div>`;
      return;
    }
    const days = data.daily.time.slice(0, 5);
    strip.innerHTML = days.map((day, i) => {
      const d = new Date(day);
      const wd = d.toLocaleDateString("de-DE", { weekday: "short" });
      return `
        <div class="weather-day">
          <div class="wd">${wd}</div>
          <div class="wicon">${weatherIcon(data.daily.weathercode[i])}</div>
          <div class="wtemp">${Math.round(data.daily.temperature_2m_max[i])}° <span class="lo">${Math.round(data.daily.temperature_2m_min[i])}°</span></div>
        </div>`;
    }).join("");
    updatedEl.textContent = fromCache
      ? `${relativeAge(fetchedAt || Date.now())} (Cache)`
      : "gerade eben";
  }

  // Cache zuerst zeigen (falls vorhanden), dann versuchen zu aktualisieren
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(cacheKey) || "null"); } catch (e) {}
  if (cached) render(cached.data, true, cached.fetchedAt);

  if (!navigator.onLine) {
    if (!cached) render(null, true);
    return;
  }
  if (cached && (Date.now() - cached.fetchedAt < WEATHER_TTL_MS)) return; // frisch genug

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const res = await fetch(url);
    const data = await res.json();
    try { localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), data })); } catch (e) {}
    render(data, false);
  } catch (e) {
    if (!cached) render(null, true);
  }
}

// ---------- JOURNAL ----------
function renderJournal() {
  const el = document.getElementById("screen-journal");
  const entries = Object.entries(state.entries)
    .filter(([id, e]) => e.rating > 0 || e.note || (e.photos && e.photos.length))
    .map(([id, e]) => ({ id, ...e, spot: findSpot(id) }))
    .filter(x => x.spot);

  if (!entries.length) {
    el.innerHTML = `
      <div class="empty-state">
        ${ROOSTER_SVG}
        <h3 style="margin-top:14px;">Noch keine Einträge</h3>
        <p style="font-size:0.86rem; margin-top:8px;">Bewerte Spots oder schreib Notizen – dein Reisetagebuch füllt sich automatisch.</p>
      </div>`;
    return;
  }
  entries.sort((a, b) => (b.visitedAt || "").localeCompare(a.visitedAt || ""));
  el.innerHTML = `<div class="section-pad">` + entries.map(e => `
    <div class="card journal-entry" data-spot="${e.id}" style="cursor:pointer;">
      ${e.photos && e.photos[0] ? `<img src="${e.photos[0]}" class="photo-thumb" style="width:56px;height:56px;" alt="Foto zu ${escapeHtml(e.spot.name)}">` : `<div class="cat-dot ${e.spot.category}" style="width:20px;height:20px;margin-top:4px;"></div>`}
      <div style="flex:1;">
        <div style="font-weight:700; font-size:0.94rem;">${e.spot.name}</div>
        <div class="stars-mini">${"★".repeat(e.rating)}${"☆".repeat(5 - e.rating)}</div>
        ${e.note ? `<div class="note-preview">${escapeHtml(e.note)}</div>` : ""}
      </div>
    </div>
  `).join("") + `</div>`;
  el.querySelectorAll(".journal-entry").forEach(card => {
    card.addEventListener("click", () => openSpotSheet(card.dataset.spot));
  });
}

// ---------- SETTINGS ----------
function renderSettings() {
  const el = document.getElementById("screen-settings");
  el.innerHTML = `
    <div class="section-pad">
      <div class="card">
        <div class="settings-row">
          <div>
            <div class="lbl">Startdatum der Reise</div>
            <div class="desc">Steuert den Tage-Zähler auf der Übersicht</div>
          </div>
          <input type="date" id="start-date-input" value="${state.startDate ? state.startDate.slice(0,10) : ""}">
        </div>
      </div>
      <div class="card">
        <div class="settings-row">
          <div>
            <div class="lbl">Offline-Status</div>
            <div class="desc" id="online-status-desc">${navigator.onLine ? "Online – Daten werden synchronisiert" : "Offline – gespeicherte Daten werden genutzt"}</div>
          </div>
          <span style="font-size:1.4rem;">${navigator.onLine ? "🟢" : "🔴"}</span>
        </div>
        <div class="settings-row">
          <div>
            <div class="lbl">Gespeicherte Einträge</div>
            <div class="desc">Besuche, Bewertungen, Notizen und Fotos – bleiben auch offline erhalten</div>
          </div>
          <span class="mono" style="font-weight:700;">${Object.values(state.entries).filter(e => e.visited || e.rating > 0 || e.note || (e.photos && e.photos.length)).length}</span>
        </div>
      </div>
      <div class="card">
        <p style="font-size:0.82rem; color:var(--ink-soft); line-height:1.5; margin:0 0 12px;">
          Alle Bewertungen, Notizen und Fotos werden ausschliesslich lokal auf diesem Gerät gespeichert –
          es gibt keinen Server. <b>Vor der Reise und danach wöchentlich exportieren</b>, dann ist bei
          Geräteverlust oder gelöschten Browserdaten nichts weg. Mit "Importieren" spielst du ein Backup
          wieder ein (auch auf einem anderen Gerät).
        </p>
        <div class="settings-row">
          <div>
            <div class="lbl">Belegter Speicher</div>
            <div class="desc" id="storage-usage-desc">wird ermittelt…</div>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn ghost block" id="export-btn">Daten exportieren (JSON)</button>
        </div>
        <div class="btn-row">
          <button class="btn ghost block" id="import-btn">Daten importieren (JSON)</button>
          <input type="file" id="import-input" accept=".json,application/json" style="display:none;">
        </div>
        <div class="btn-row">
          <button class="btn ghost block" id="reset-btn" style="color:#b3261e;">Alle Daten zurücksetzen</button>
        </div>
      </div>
      <div class="card">
        <span class="eyebrow">Praktische Infos</span>
        <h3 style="margin-bottom:10px;">Maut in Portugal (Stand 2026)</h3>
        <p style="font-size:0.82rem; color:var(--ink-soft); line-height:1.6; margin:0 0 10px;">
          Seit Januar 2025 sind mehrere ehemalige Elektronik-Mautstrecken gebührenfrei, u. a.
          <b>A22 Algarve</b> (komplette Via do Infante), A23, A24, A25, A28 (Teile) und der A4-Marão-Tunnel.
          Weiterhin kostenpflichtig: <b>A1 Lissabon–Porto</b> (ca. 25€ Pkw / ca. 43€ Wohnmobil für die
          Gesamtstrecke) und <b>A2 Lissabon–Algarve</b> (ca. 24€ Pkw / ca. 42€ Wohnmobil). Wohnmobile
          zahlen als Fahrzeugklasse 2 rund 80% mehr als ein Pkw. Zusätzlich mautpflichtig: die Brücken
          Vasco da Gama und 25 de Abril in Lissabon (nur bei Einfahrt Richtung Norden/Stadt).
        </p>
        <p style="font-size:0.82rem; color:var(--ink-soft); line-height:1.6; margin:0 0 12px;">
          Praktischste Lösung für Camper ohne festen Via-Verde-Transponder: <b>Easytoll</b> an einem
          Welcome Point bei der Einreise registrieren (Kennzeichen + Kreditkarte, 30 Tage gültig) oder
          eine <b>Toll Card</b> (Prepaid 5-40€) an der Post/Tankstelle kaufen.
        </p>
        <div class="btn-row">
          <a class="btn ghost block" style="text-decoration:none; text-align:center;" target="_blank" href="https://www.portugaltolls.com">portugaltolls.com ↗</a>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:10px;">Weitere Quellen zum Gegenchecken</h3>
        <p style="font-size:0.82rem; color:var(--ink-soft); line-height:1.6; margin:0 0 12px;">
          Diese App nutzt Open-Meteo für die Wettervorhersage und Pincamp-Recherche für Stellplätze.
          Für eine zweite Meinung unterwegs:
        </p>
        <div class="btn-row">
          <a class="btn ghost block" style="text-decoration:none; text-align:center; font-size:0.8rem;" target="_blank" href="https://www.ipma.pt/pt/otempo/prev.localidade.hora/">IPMA-Wetterwarnungen ↗</a>
        </div>
        <div class="btn-row">
          <a class="btn ghost block" style="text-decoration:none; text-align:center; font-size:0.8rem;" target="_blank" href="https://www.campercontact.com/de/portugal">campercontact.com ↗</a>
        </div>
      </div>
      <div class="card">
        <span class="eyebrow">Über diese App</span>
        <p style="font-size:0.82rem; color:var(--ink-soft); line-height:1.5;">
          Portugal Camper-Tour · Reisebegleiter für 4 Wochen. Kartendaten © OpenStreetMap-Mitwirkende.
          Wetterdaten von Open-Meteo. Als PWA installierbar über "Zum Home-Bildschirm hinzufügen".
        </p>
      </div>
    </div>
  `;
  document.getElementById("start-date-input").addEventListener("change", (e) => {
    state.startDate = e.target.value ? new Date(e.target.value).toISOString() : null;
    saveState();
    showToast("✓ Startdatum gespeichert");
  });
  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-input").click());
  document.getElementById("import-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importData(file);
    e.target.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Wirklich alle Bewertungen, Notizen und Fotos löschen? Das kann nicht rückgängig gemacht werden.")) {
      localStorage.removeItem(STORAGE_KEY);
      Object.keys(localStorage)
        .filter(k => k.startsWith(WEATHER_CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
      state = loadState();
      updateJournalBadge();
      renderSettings(); renderHome();
      showToast("Alle Daten wurden zurückgesetzt.");
    }
  });
  updateStorageUsage();
}

// Zeigt an, wie viel lokaler Speicher belegt ist – so sieht man rechtzeitig,
// wenn es (v. a. durch Fotos) eng wird
async function updateStorageUsage() {
  const el = document.getElementById("storage-usage-desc");
  if (!el) return;
  // Grösse der App-Daten in localStorage (Fotos, Notizen, Wetter-Cache)
  let bytes = 0;
  try {
    for (const k of Object.keys(localStorage)) {
      if (k === STORAGE_KEY || k.startsWith(WEATHER_CACHE_PREFIX)) {
        bytes += (localStorage.getItem(k) || "").length * 2; // UTF-16: 2 Bytes/Zeichen
      }
    }
  } catch (e) {}
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  const LIMIT_MB = 5; // typische localStorage-Grenze
  const pct = Math.min(Math.round((bytes / (LIMIT_MB * 1024 * 1024)) * 100), 100);
  el.textContent = `${mb} MB von ca. ${LIMIT_MB} MB (${pct}%)`;
  if (pct >= 80) {
    el.textContent += " – bald voll! Exportieren und alte Fotos löschen.";
    el.style.color = "#b3261e";
  }
}

function importData(file) {
  const reader = new FileReader();
  reader.onerror = () => showToast("Datei konnte nicht gelesen werden.", 3000);
  reader.onload = () => {
    let imported;
    try {
      imported = JSON.parse(reader.result);
    } catch (e) {
      showToast("Das ist keine gültige JSON-Datei.", 3000);
      return;
    }
    // Validierung: muss wie ein Export dieser App aussehen
    if (!imported || typeof imported !== "object" || typeof imported.entries !== "object") {
      showToast("Die Datei sieht nicht wie ein Backup dieser App aus (Feld \"entries\" fehlt).", 3600);
      return;
    }
    const count = Object.keys(imported.entries || {}).length;
    if (!confirm(`Backup mit ${count} Einträgen gefunden. Aktuelle Daten auf diesem Gerät werden ersetzt. Fortfahren?`)) return;
    state = {
      startDate: imported.startDate || null,
      currentRegionId: imported.currentRegionId || TRIP_DATA.regions[0].id,
      entries: imported.entries || {},
      customSpots: imported.customSpots || []
    };
    saveState();
    updateJournalBadge();
    renderSettings(); renderHome(); renderRegions(); renderJournal();
    showToast(`✓ ${count} Einträge importiert`);
  };
  reader.readAsText(file);
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url; a.download = `portugal-camper-tour-daten-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("✓ Backup heruntergeladen");
}

// ---------- MAP (Leaflet) ----------
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || !window.L) return;
  routeInfoEl = document.getElementById("route-info");
  const map = L.map(mapEl, { zoomControl: false }).setView([39.6, -8.3], 6.4);
  window._leafletMap = map;
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap-Mitwirkende"
  }).addTo(map);

  document.getElementById("locate-btn").addEventListener("click", () => {
    locateUser((loc) => map.setView([loc.lat, loc.lon], 12));
  });

  const catColors = { natur: "#4E8A6C", genuss: "#C08A2E", kultur: "#4A7BA6", camping: "#3E8A93" };
  const allPts = [];
  const markers = {};

  TRIP_DATA.regions.forEach(region => {
    const regionLatLngs = [];
    region.spots.forEach(spot => {
      const color = catColors[spot.category] || "#1B4F72";
      const marker = L.circleMarker([spot.lat, spot.lon], {
        radius: 8, weight: 2, color: "#fff", fillColor: color, fillOpacity: 0.95
      }).addTo(map);
      marker.bindPopup(`
        <div class="popup-cat" style="color:${color}">${CATEGORY_ICON[spot.category]} ${CATEGORY_LABEL[spot.category]}</div>
        <div class="popup-title">${spot.name}</div>
        <div style="display:flex; gap:6px;">
          <button class="popup-btn" onclick="openSpotSheet('${spot.id}')">Details</button>
          <button class="popup-btn" style="background:var(--terracotta);" onclick="showRouteToSpot({id:'${spot.id}',name:'${spot.name.replace(/'/g, "\\'")}',lat:${spot.lat},lon:${spot.lon}})">Route</button>
        </div>
      `);
      markers[spot.category] = markers[spot.category] || [];
      markers[spot.category].push(marker);
      regionLatLngs.push([spot.lat, spot.lon]);
      allPts.push([spot.lat, spot.lon]);
    });
    if (regionLatLngs.length > 1) {
      L.polyline(regionLatLngs, { color: "#7C5CE0", weight: 2, opacity: 0.25, dashArray: "1 8" }).addTo(map);
    }
  });

  if (allPts.length) {
    window._mapBounds = allPts;
    window._mapFitted = false;
    map.fitBounds(allPts, { padding: [30, 30] });
  }

  // Filter-Legende
  const legend = document.getElementById("map-legend");
  let activeFilter = "all";
  legend.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.cat;
      legend.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
      Object.entries(markers).forEach(([cat, list]) => {
        list.forEach(m => {
          const show = activeFilter === "all" || activeFilter === cat;
          if (show) { if (!map.hasLayer(m)) m.addTo(map); }
          else { if (map.hasLayer(m)) map.removeLayer(m); }
        });
      });
    });
  });
}

// ---------- Galo de Barcelos (Maskottchen) ----------
// Stilisierter Hahn im Look des berühmten Hahns von Barcelos, Portugals Nationalsymbol,
// in den Pastellfarben der App gehalten.
const ROOSTER_SVG = `
<svg class="rooster-mascot" viewBox="0 0 100 100" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 55 Q0 33 6 12 Q22 28 27 50 Z" fill="#7C5CE0"/>
  <path d="M26 58 Q12 44 18 18 Q30 34 34 55 Z" fill="#B9A7F0"/>
  <path d="M32 60 Q22 50 30 28 Q37 41 38 58 Z" fill="#C9922E"/>
  <ellipse cx="55" cy="63" rx="27" ry="23" fill="#241F31"/>
  <circle cx="47" cy="58" r="3" fill="#F5F2FA"/>
  <circle cx="61" cy="66" r="3" fill="#F5F2FA"/>
  <circle cx="51" cy="72" r="2.4" fill="#F5F2FA"/>
  <circle cx="67" cy="56" r="2.4" fill="#F5F2FA"/>
  <circle cx="58" cy="50" r="2.4" fill="#F5F2FA"/>
  <circle cx="78" cy="40" r="15" fill="#241F31"/>
  <path class="comb" d="M71 26 Q73 15 78 25 Q80 13 85 25 Q88 18 89 30 Q80 22 71 26Z" fill="#C4553E"/>
  <path d="M87 45 Q94 49 89 56 Q84 51 87 45Z" fill="#C4553E"/>
  <path d="M91 37 L100 40 L91 44 Z" fill="#C9922E"/>
  <circle cx="83" cy="36" r="2.2" fill="#F5F2FA"/>
  <line x1="49" y1="83" x2="47" y2="97" stroke="#C9922E" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="63" y1="84" x2="65" y2="97" stroke="#C9922E" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const CELEBRATION_MESSAGES = [
  "Bem escolhido! ✨",
  "Boa viagem! 🐓",
  "Guter Fund!",
  "Ab ins Tagebuch damit!",
  "Weiter geht's!"
];

function celebrate(message) {
  const toast = document.createElement("div");
  toast.className = "celebration-toast";
  const msg = message || CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
  toast.innerHTML = `${ROOSTER_SVG}<span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 320);
  }, 1600);
}

function popAnimate(el) {
  if (!el) return;
  el.classList.remove("pop");
  void el.offsetWidth; // reflow, damit die Animation neu startet
  el.classList.add("pop");
}


let userLocation = null; // {lat, lon}
let userMarker = null;
let routeLayer = null;
let routeInfoEl = null;

function locateUser(onDone) {
  if (!navigator.geolocation) {
    alert("Standortbestimmung wird von diesem Browser nicht unterstützt.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      placeUserMarker();
      if (onDone) onDone(userLocation);
    },
    (err) => {
      alert("Standort konnte nicht ermittelt werden. Bitte Standortzugriff in den Browser-/App-Einstellungen erlauben.");
      console.warn(err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function placeUserMarker() {
  if (!window._leafletMap || !userLocation) return;
  if (userMarker) window._leafletMap.removeLayer(userMarker);
  userMarker = L.circleMarker([userLocation.lat, userLocation.lon], {
    radius: 9, weight: 3, color: "#fff", fillColor: "#7C5CE0", fillOpacity: 1
  }).addTo(window._leafletMap).bindPopup("Dein Standort");
}

// Berechnet eine Fahrroute über den öffentlichen OSRM-Demo-Server (kein API-Key nötig,
// aber nur für moderate Nutzung gedacht - kein Ersatz für gesprochene Turn-by-Turn-Navigation).
async function showRouteToSpot(spot) {
  if (!navigator.onLine) {
    alert("Für die Routenberechnung wird eine Internetverbindung benötigt. Nutze stattdessen den Link 'In Karten-App öffnen' für Offline-Navigation mit installierten Kartendaten.");
    return;
  }
  showScreen("map");
  if (!userLocation) {
    locateUser(() => showRouteToSpot(spot));
    return;
  }
  clearRoute();
  renderRouteInfo("Route wird berechnet…");
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lon},${userLocation.lat};${spot.lon},${spot.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes || !data.routes.length) throw new Error("keine Route gefunden");
    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
    routeLayer = L.polyline(coords, { color: "#7C5CE0", weight: 5, opacity: 0.9 }).addTo(window._leafletMap);
    window._leafletMap.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
    const km = (route.distance / 1000).toFixed(1);
    const mins = Math.round(route.duration / 60);
    const h = Math.floor(mins / 60), m = mins % 60;
    const timeStr = h > 0 ? `${h} Std. ${m} Min.` : `${m} Min.`;
    renderRouteInfo(`${km} km · ca. ${timeStr} bis ${spot.name}`, spot);
  } catch (e) {
    renderRouteInfo("Route konnte nicht berechnet werden (Server evtl. überlastet). Nutze 'In Karten-App öffnen' als Alternative.");
    console.warn(e);
  }
}

function clearRoute() {
  if (routeLayer && window._leafletMap) { window._leafletMap.removeLayer(routeLayer); routeLayer = null; }
}

function renderRouteInfo(text, spot) {
  if (!routeInfoEl) return;
  routeInfoEl.style.display = "flex";
  routeInfoEl.innerHTML = `
    <div style="flex:1;">${text}</div>
    ${spot ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}&travelmode=driving" target="_blank" class="btn terracotta" style="min-height:36px; padding:8px 14px; font-size:0.76rem;">Turn-by-Turn ↗</a>` : ""}
    <button class="icon-btn" style="width:32px;height:32px; background:rgba(0,0,0,0.15);" onclick="hideRouteInfo()">✕</button>
  `;
}
function hideRouteInfo() {
  clearRoute();
  if (routeInfoEl) routeInfoEl.style.display = "none";
}


function watchOnlineStatus() {
  const update = () => document.body.classList.toggle("offline", !navigator.onLine);
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

// ---------- Service Worker ----------
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch(err => console.warn("SW-Registrierung fehlgeschlagen", err));

  // Der Service Worker meldet, wenn er im Hintergrund neue Inhalte geladen hat
  // (z. B. aktualisierte Spots in data.js) – dann bieten wir einen Neustart an
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "content-updated") showUpdateBanner();
  });
}

let _updateBannerShown = false;
function showUpdateBanner() {
  if (_updateBannerShown) return;
  _updateBannerShown = true;
  const bar = document.createElement("div");
  bar.className = "update-banner";
  bar.innerHTML = `
    <span>Neue Version der App verfügbar.</span>
    <button class="btn terracotta" id="update-reload-btn" style="min-height:36px; padding:8px 14px; font-size:0.78rem;">Jetzt laden</button>
    <button class="icon-btn" id="update-dismiss-btn" aria-label="Später" style="width:32px;height:32px; background:rgba(255,255,255,0.15); color:#fff;">✕</button>
  `;
  document.body.appendChild(bar);
  document.getElementById("update-reload-btn").addEventListener("click", () => location.reload());
  document.getElementById("update-dismiss-btn").addEventListener("click", () => bar.remove());
}
