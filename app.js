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
    if (typeof updateDrivenRoute === "function" && window._drivenLine) updateDrivenRoute();
  } catch (e) {
    // Häufigster Fall: Speicher voll (zu viele/zu große Fotos in Notizen)
    console.error("Speichern fehlgeschlagen", e);
    alert("⚠️ Deine Daten konnten nicht gespeichert werden – der Gerätespeicher für die App ist voll. "
      + "Bitte exportiere in den Einstellungen ein Backup und lösche ggf. einige Fotos aus den Notizen.");
  }
}

// Bittet den Browser, die App-Daten dauerhaft zu behalten (nicht automatisch zu löschen).
// Besonders für iOS/Safari wichtig, das PWA-Daten sonst nach ~7 Tagen Inaktivität verwerfen kann.
async function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch (e) { /* nicht kritisch */ }
}
let state = loadState();

function getEntry(spotId) {
  if (!state.entries[spotId]) {
    state.entries[spotId] = { visited: false, skipped: false, rating: 0, note: "", photos: [], visitedAt: null };
  }
  return state.entries[spotId];
}

function allSpots() {
  const spots = [];
  TRIP_DATA.regions.forEach(r => r.spots.forEach(s => spots.push({ ...s, regionId: r.id, regionName: r.name })));
  (state.customSpots || []).forEach(s => spots.push({ ...s, regionName: "Eigene Orte" }));
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
  if (name === "map") setTimeout(() => { if (window._leafletMap) window._leafletMap.invalidateSize(); }, 50);
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
});

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
        <span>📍 ${visitedCount} besucht</span>
        <span>⭐ ${ratedCount} bewertet</span>
      </div>
      <div class="current-region-pill">🚐 Aktuell: ${current.name}</div>
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
    <div class="region-card" data-region="${region.id}" style="${isCurrent ? "border-color:" + region.color + ";" : ""}">
      <div class="region-head">
        <div class="num mono">${String(region.order).padStart(2, "0")}</div>
        <div class="titles">
          <h3>${region.name} ${isCurrent ? "🚐" : ""}</h3>
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
  const custom = (state.customSpots || []).find(s => s.id === spotId);
  if (custom) return { ...custom, regionName: "Eigene Orte" };
  return null;
}

function openSpotSheet(spotId) {
  const spot = findSpot(spotId);
  if (!spot) return;
  const entry = getEntry(spotId);
  const backdrop = document.getElementById("sheet-backdrop");
  const sheet = document.getElementById("sheet");

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

      <div class="spot-gallery" id="spot-gallery"></div>

      <p style="font-size:0.92rem; line-height:1.5;">${spot.description || "Keine Beschreibung hinterlegt."}</p>

      ${spot.why ? `<div class="why-box"><span class="why-label">⭐ Warum sehenswert</span><p>${spot.why}</p></div>` : ""}

      <div class="coord-row mono">
        📍 ${spot.lat?.toFixed(5)}, ${spot.lon?.toFixed(5)}
        <button class="btn ghost" style="min-height:32px; padding:6px 12px; font-size:0.72rem;" onclick="copyCoords(${spot.lat}, ${spot.lon})">Kopieren</button>
      </div>
      <div class="btn-row">
        <button class="btn primary" style="flex:1;" onclick="showRouteToSpot({id:'${spot.id}',name:'${(spot.name||"").replace(/'/g,"\\'")}',lat:${spot.lat},lon:${spot.lon}}); closeSheet();">🚐 Route berechnen</button>
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
        <div class="rating-row" id="rating-row">
          ${[1,2,3,4,5].map(n => `<button class="star-btn ${entry.rating >= n ? "on" : ""}" data-star="${n}">★</button>`).join("")}
        </div>
      </div>

      <div>
        <span class="eyebrow">Notiz</span>
        <textarea class="note-input" id="note-input" placeholder="Wie war's? Tipps für später, Wegbeschreibung, Eindrücke...">${entry.note || ""}</textarea>
      </div>

      <div>
        <span class="eyebrow">Fotos</span>
        <div class="photo-row" id="photo-row">
          ${(entry.photos || []).map((p, i) => `<img class="photo-thumb" src="${p}" onclick="removePhoto('${spotId}', ${i})">`).join("")}
          <button class="photo-add" id="photo-add-btn">+</button>
          <input type="file" id="photo-input" accept="image/*" capture="environment" style="display:none;">
        </div>
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
      openSpotSheet(spotId);
    });
  });
  document.getElementById("note-input").addEventListener("blur", (e) => {
    entry.note = e.target.value; saveState();
  });
  document.getElementById("visited-btn").addEventListener("click", (e) => {
    const wasVisited = entry.visited;
    entry.visited = !entry.visited;
    entry.visitedAt = entry.visited ? new Date().toISOString() : null;
    saveState();
    if (!wasVisited && entry.visited) celebrate();
    popAnimate(e.currentTarget);
    updateDrivenRoute();
    openSpotSheet(spotId);
  });
  document.getElementById("skip-toggle-btn").addEventListener("click", () => {
    entry.skipped = !entry.skipped;
    saveState();
    openSpotSheet(spotId);
  });
  document.getElementById("photo-add-btn").addEventListener("click", () => document.getElementById("photo-input").click());
  document.getElementById("photo-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      entry.photos = entry.photos || [];
      entry.photos.push(reader.result);
      saveState();
      openSpotSheet(spotId);
    };
    reader.readAsDataURL(file);
  });

  backdrop.classList.add("show");
  sheet.classList.add("show");
  document.body.style.overflow = "hidden";

  loadWeather(spot);
  loadSpotImages(spot, document.getElementById("spot-gallery"));
}
function removePhoto(spotId, idx) {
  const entry = getEntry(spotId);
  entry.photos.splice(idx, 1);
  saveState();
  openSpotSheet(spotId);
}
function closeSheet() {
  document.getElementById("sheet-backdrop").classList.remove("show");
  document.getElementById("sheet").classList.remove("show");
  document.body.style.overflow = "";
  renderRegions(); renderJournal(); renderHome();
}
function copyCoords(lat, lon) {
  const text = `${lat}, ${lon}`;
  if (navigator.clipboard) navigator.clipboard.writeText(text);
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

  function render(data, fromCache) {
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
    updatedEl.textContent = fromCache ? "aus Cache (offline)" : "gerade eben";
  }

  // Cache zuerst zeigen (falls vorhanden), dann versuchen zu aktualisieren
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(cacheKey) || "null"); } catch (e) {}
  if (cached) render(cached.data, true);

  if (!navigator.onLine) {
    if (!cached) render(null, true);
    return;
  }
  if (cached && (Date.now() - cached.fetchedAt < WEATHER_TTL_MS)) return; // frisch genug

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const res = await fetch(url);
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), data }));
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
      ${e.photos && e.photos[0] ? `<img src="${e.photos[0]}" class="photo-thumb" style="width:56px;height:56px;">` : `<div class="cat-dot ${e.spot.category}" style="width:20px;height:20px;margin-top:4px;"></div>`}
      <div style="flex:1;">
        <div style="font-weight:700; font-size:0.94rem;">${e.spot.name}</div>
        <div class="stars-mini">${"★".repeat(e.rating)}${"☆".repeat(5 - e.rating)}</div>
        ${e.note ? `<div class="note-preview">${e.note}</div>` : ""}
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
            <div class="lbl">Gespeicherte Bewertungen</div>
            <div class="desc">Bleiben auf diesem Gerät erhalten, auch offline</div>
          </div>
          <span class="mono" style="font-weight:700;">${Object.keys(state.entries).length}</span>
        </div>
      </div>
      <div class="card">
        <p style="font-size:0.82rem; color:var(--ink-soft); line-height:1.5; margin:0 0 12px;">
          Alle Bewertungen, Notizen und Fotos werden ausschließlich lokal auf diesem Gerät gespeichert (localStorage) –
          es gibt keinen Server. Beim Löschen der Browserdaten gehen sie verloren, daher lohnt sich gelegentlich ein Export.
        </p>
        <div class="btn-row">
          <button class="btn ghost block" id="export-btn">Daten exportieren (JSON)</button>
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
  });
  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Wirklich alle Bewertungen, Notizen und Fotos löschen? Das kann nicht rückgängig gemacht werden.")) {
      localStorage.removeItem(STORAGE_KEY);
      state = loadState();
      renderSettings(); renderHome();
    }
  });
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "portugal-camper-tour-daten.json";
  a.click();
  URL.revokeObjectURL(url);
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
  document.getElementById("add-spot-btn").addEventListener("click", () => openAddSpotForm());

  // Custom-Spots (eigene Orte) als Marker mit Stern-Symbol ergänzen
  renderCustomMarkers();

  const catColors = { natur: "#5B9E7D", genuss: "#D9A441", kultur: "#5B84AC", camping: "#9B85C9" };
  const allPts = [];
  const markers = {};

  // Reihenfolge-Ankerpunkte für die geplante Gesamtroute (ein repräsentativer Punkt je Region,
  // der Einfachheit halber der erste Spot jeder Region)
  const plannedPath = [];

  TRIP_DATA.regions.forEach(region => {
    if (region.spots.length) {
      plannedPath.push([region.spots[0].lat, region.spots[0].lon]);
    }
    region.spots.forEach(spot => {
      const color = catColors[spot.category] || "#5B84AC";
      const marker = L.circleMarker([spot.lat, spot.lon], {
        radius: 8, weight: 2, color: "#fff", fillColor: color, fillOpacity: 0.95
      }).addTo(map);
      marker.bindPopup(`
        <div class="popup-cat" style="color:${color}">${CATEGORY_ICON[spot.category]} ${CATEGORY_LABEL[spot.category]}</div>
        <div class="popup-title">${spot.name}</div>
        <div style="display:flex; gap:6px;">
          <button class="popup-btn" onclick="openSpotSheet('${spot.id}')">Details</button>
          <button class="popup-btn" style="background:var(--terracotta);" onclick="showRouteToSpot({id:'${spot.id}',name:'${spot.name.replace(/'/g, "\\'")}',lat:${spot.lat},lon:${spot.lon}})">Route 🚐</button>
        </div>
      `);
      markers[spot.category] = markers[spot.category] || [];
      markers[spot.category].push(marker);
      allPts.push([spot.lat, spot.lon]);
    });
  });

  // Geplante Gesamtroute (blaue gestrichelte Linie, verbindet die Regionen in Reihenfolge)
  window._plannedLine = L.polyline(plannedPath, {
    color: "#5B84AC", weight: 3, opacity: 0.55, dashArray: "2 9"
  }).addTo(map);

  // Effektiv gefahrene Route (Koralle, durchgezogen) - wird aus besuchten Orten gebildet
  window._drivenLine = L.polyline([], {
    color: "#CB7B62", weight: 4, opacity: 0.9
  }).addTo(map);
  updateDrivenRoute();

  if (allPts.length) map.fitBounds(allPts, { padding: [30, 30] });

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

// ---------- Wikimedia-Bilder (kostenlos, legal einbettbar) ----------
const IMG_CACHE_PREFIX = "pt_camper_img_";
const IMG_TTL_MS = 30 * 24 * 3600 * 1000; // 30 Tage

// Holt bis zu 3 Bilder zu einem Ort von Wikimedia Commons (via Koordinaten-Umkreissuche).
async function loadSpotImages(spot, containerEl) {
  if (!containerEl) return;
  const cacheKey = IMG_CACHE_PREFIX + spot.id;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(cacheKey) || "null"); } catch (e) {}

  function render(urls) {
    if (!urls || !urls.length) {
      containerEl.innerHTML = `<div class="img-placeholder">${CATEGORY_ICON[spot.category]}<span>Kein Foto gefunden</span></div>`;
      return;
    }
    containerEl.innerHTML = urls.slice(0, 3).map((u, i) =>
      `<img class="spot-photo ${i === 0 ? "lead" : ""}" src="${u}" loading="lazy" alt="${spot.name}" onerror="this.style.display='none'">`
    ).join("");
  }

  if (cached && cached.urls && (Date.now() - cached.fetchedAt < IMG_TTL_MS)) {
    render(cached.urls);
    return;
  }
  if (!navigator.onLine) {
    render(cached ? cached.urls : null);
    return;
  }

  containerEl.innerHTML = `<div class="img-placeholder">📷<span>Lade Fotos…</span></div>`;
  try {
    // 1) Bilder in der Nähe der Koordinaten suchen
    const geoUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gsradius=1200&gscoord=${spot.lat}|${spot.lon}&gslimit=8&gsnamespace=6&format=json&origin=*`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    let titles = (geoData.query?.geosearch || []).map(g => g.title);

    // 2) Fallback: Textsuche nach dem Ortsnamen
    if (titles.length === 0) {
      const searchTerm = spot.name.replace(/\(.*?\)/g, "").split(",")[0].trim();
      const srUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=6&format=json&origin=*`;
      const srRes = await fetch(srUrl);
      const srData = await srRes.json();
      titles = (srData.query?.search || []).map(s => s.title);
    }

    if (!titles.length) { render(null); return; }

    // 3) Zu den gefundenen Datei-Titeln die tatsächlichen Bild-URLs (skaliert) holen
    const imgInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.slice(0, 6).join("|"))}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;
    const iiRes = await fetch(imgInfoUrl);
    const iiData = await iiRes.json();
    const pages = iiData.query?.pages || {};
    const urls = Object.values(pages)
      .map(p => p.imageinfo?.[0]?.thumburl)
      .filter(Boolean)
      .filter(u => !/\.svg/i.test(u)); // keine Icons/Karten

    localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), urls }));
    render(urls);
  } catch (e) {
    render(cached ? cached.urls : null);
  }
}


// Stilisierter Hahn im Look des berühmten Hahns von Barcelos, Portugals Nationalsymbol,
// in den Pastellfarben der App gehalten.
const ROOSTER_SVG = `
<svg class="rooster-mascot" viewBox="0 0 100 100" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 55 Q0 33 6 12 Q22 28 27 50 Z" fill="#5B84AC"/>
  <path d="M26 58 Q12 44 18 18 Q30 34 34 55 Z" fill="#9B85C9"/>
  <path d="M32 60 Q22 50 30 28 Q37 41 38 58 Z" fill="#D9A441"/>
  <ellipse cx="55" cy="63" rx="27" ry="23" fill="#CB7B62"/>
  <circle cx="47" cy="58" r="3" fill="#FDF8F4"/>
  <circle cx="61" cy="66" r="3" fill="#FDF8F4"/>
  <circle cx="51" cy="72" r="2.4" fill="#FDF8F4"/>
  <circle cx="67" cy="56" r="2.4" fill="#FDF8F4"/>
  <circle cx="58" cy="50" r="2.4" fill="#FDF8F4"/>
  <circle cx="78" cy="40" r="15" fill="#CB7B62"/>
  <path class="comb" d="M71 26 Q73 15 78 25 Q80 13 85 25 Q88 18 89 30 Q80 22 71 26Z" fill="#E0836E"/>
  <path d="M87 45 Q94 49 89 56 Q84 51 87 45Z" fill="#E0836E"/>
  <path d="M91 37 L100 40 L91 44 Z" fill="#D9A441"/>
  <circle cx="83" cy="36" r="2.2" fill="#40454B"/>
  <line x1="49" y1="83" x2="47" y2="97" stroke="#D9A441" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="63" y1="84" x2="65" y2="97" stroke="#D9A441" stroke-width="3.5" stroke-linecap="round"/>
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
    radius: 9, weight: 3, color: "#fff", fillColor: "#1B4F72", fillOpacity: 1
  }).addTo(window._leafletMap).bindPopup("📍 Dein Standort");
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
    routeLayer = L.polyline(coords, { color: "#C1602A", weight: 5, opacity: 0.85 }).addTo(window._leafletMap);
    window._leafletMap.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
    const km = (route.distance / 1000).toFixed(1);
    const mins = Math.round(route.duration / 60);
    const h = Math.floor(mins / 60), m = mins % 60;
    const timeStr = h > 0 ? `${h} Std. ${m} Min.` : `${m} Min.`;
    renderRouteInfo(`🚐 ${km} km · ca. ${timeStr} bis ${spot.name}`, spot);
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

// Zeichnet die effektiv gefahrene Route: verbindet alle als "besucht" markierten Orte
// in der Reihenfolge ihres Besuchsdatums (visitedAt).
function updateDrivenRoute() {
  if (!window._drivenLine) return;
  const visited = allSpots()
    .map(s => ({ s, e: state.entries[s.id] }))
    .filter(x => x.e && x.e.visited && x.e.visitedAt)
    .sort((a, b) => a.e.visitedAt.localeCompare(b.e.visitedAt))
    .map(x => [x.s.lat, x.s.lon]);
  window._drivenLine.setLatLngs(visited);
}

// ---------- Karten-Layer-Umschalter (geplant / gefahren) ----------
let showPlanned = true, showDriven = true;
function toggleMapLayer(which) {
  const map = window._leafletMap;
  if (!map) return;
  if (which === "planned") {
    showPlanned = !showPlanned;
    if (showPlanned) window._plannedLine.addTo(map); else map.removeLayer(window._plannedLine);
  } else if (which === "driven") {
    showDriven = !showDriven;
    if (showDriven) window._drivenLine.addTo(map); else map.removeLayer(window._drivenLine);
  }
  document.querySelectorAll(".route-toggle button").forEach(b => {
    if (b.dataset.layer === "planned") b.classList.toggle("active", showPlanned);
    if (b.dataset.layer === "driven") b.classList.toggle("active", showDriven);
  });
}

// ---------- Eigene Orte (manuell hinzufügen) ----------
let _customMarkers = [];
function renderCustomMarkers() {
  const map = window._leafletMap;
  if (!map) return;
  _customMarkers.forEach(m => map.removeLayer(m));
  _customMarkers = [];
  (state.customSpots || []).forEach(spot => {
    const marker = L.marker([spot.lat, spot.lon], {
      icon: L.divIcon({
        className: "custom-spot-icon",
        html: `<div class="custom-pin">★</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14]
      })
    }).addTo(map);
    marker.bindPopup(`
      <div class="popup-cat" style="color:#CB7B62">★ Eigener Ort</div>
      <div class="popup-title">${spot.name}</div>
      <button class="popup-btn" onclick="openSpotSheet('${spot.id}')">Details</button>
    `);
    _customMarkers.push(marker);
  });
}

function openAddSpotForm(prefill) {
  const backdrop = document.getElementById("sheet-backdrop");
  const sheet = document.getElementById("sheet");
  const loc = prefill || userLocation;
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-header">
        <h2>Eigenen Ort hinzufügen</h2>
        <button class="icon-btn" style="background:var(--cream-dim); color:var(--ink);" onclick="closeSheet()">✕</button>
      </div>
      <p style="font-size:0.84rem; color:var(--ink-soft);">Füge einen Spot hinzu, den ihr unterwegs entdeckt habt – er erscheint als ★ auf der Karte und im Tagebuch.</p>

      <label class="form-label">Name</label>
      <input type="text" id="cs-name" class="form-input" placeholder="z. B. Geheime Bucht bei Sagres">

      <label class="form-label">Kategorie</label>
      <div class="chip-row" id="cs-cat">
        <button class="chip active" data-cat="natur">🌿 Natur</button>
        <button class="chip" data-cat="genuss">🍷 Genuss</button>
        <button class="chip" data-cat="kultur">🏛️ Kultur</button>
        <button class="chip" data-cat="camping">🚐 Camping</button>
      </div>

      <label class="form-label">Koordinaten</label>
      <div style="display:flex; gap:8px;">
        <input type="number" step="any" id="cs-lat" class="form-input" placeholder="Breite (lat)" value="${loc ? loc.lat.toFixed(5) : ""}">
        <input type="number" step="any" id="cs-lon" class="form-input" placeholder="Länge (lon)" value="${loc ? loc.lon.toFixed(5) : ""}">
      </div>
      <button class="btn ghost block" style="margin-top:8px;" id="cs-use-location">📍 Meinen aktuellen Standort verwenden</button>

      <label class="form-label" style="margin-top:14px;">Beschreibung (optional)</label>
      <textarea id="cs-desc" class="note-input" placeholder="Was ist hier besonders?"></textarea>

      <div class="btn-row" style="margin-top:16px;">
        <button class="btn primary block" id="cs-save">Ort speichern</button>
      </div>
    </div>
  `;
  let selectedCat = "natur";
  sheet.querySelectorAll("#cs-cat .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      sheet.querySelectorAll("#cs-cat .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedCat = chip.dataset.cat;
    });
  });
  document.getElementById("cs-use-location").addEventListener("click", () => {
    locateUser((l) => {
      document.getElementById("cs-lat").value = l.lat.toFixed(5);
      document.getElementById("cs-lon").value = l.lon.toFixed(5);
    });
  });
  document.getElementById("cs-save").addEventListener("click", () => {
    const name = document.getElementById("cs-name").value.trim();
    const lat = parseFloat(document.getElementById("cs-lat").value);
    const lon = parseFloat(document.getElementById("cs-lon").value);
    if (!name) { alert("Bitte einen Namen eingeben."); return; }
    if (isNaN(lat) || isNaN(lon)) { alert("Bitte gültige Koordinaten eingeben (oder Standort verwenden)."); return; }
    const spot = {
      id: "custom_" + Date.now(),
      name, lat, lon,
      category: selectedCat,
      description: document.getElementById("cs-desc").value.trim(),
      cost: "", access: "", amenities: "",
      source: "custom"
    };
    state.customSpots = state.customSpots || [];
    state.customSpots.push(spot);
    saveState();
    renderCustomMarkers();
    celebrate("Ort gespeichert! ★");
    closeSheet();
    if (window._leafletMap) window._leafletMap.setView([lat, lon], 12);
  });

  backdrop.classList.add("show");
  sheet.classList.add("show");
  document.body.style.overflow = "hidden";
}

function watchOnlineStatus() {
  const update = () => document.body.classList.toggle("offline", !navigator.onLine);
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

// ---------- Service Worker ----------
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(err => console.warn("SW-Registrierung fehlgeschlagen", err));
  }
}
