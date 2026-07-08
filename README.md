# Portugal Camper-Tour — Reisebegleiter (PWA)

Eine installierbare Progressive Web App für eure 4-wöchige Camper-Reise: Route mit
allen Spots auf einer Karte, Detailinfos, Wettervorhersage, Bewertungen & Notizen —
alles offline nutzbar, sobald einmal geladen.

## Wichtig zuerst: Hosting nötig für "Installierbar auf dem Homescreen"

Ein Service Worker (= Grundlage für Offline-Fähigkeit und Installierbarkeit) läuft aus
Sicherheitsgründen **nur über HTTPS oder localhost** — nicht, wenn man die `index.html`
einfach per Doppelklick lokal öffnet (`file://`-URLs funktionieren nicht). Ihr müsst die
Dateien einmal irgendwo hosten. Die einfachsten, kostenlosen Optionen:

### Option A — Netlify Drop (schnellste, kein Account nötig für Test)
1. Gehe auf https://app.netlify.com/drop
2. Ziehe den ganzen `pwa`-Ordner (mit allen Unterordnern) in das Browserfenster
3. Fertig — du bekommst eine URL wie `https://xyz123.netlify.app`

### Option B — GitHub Pages (dauerhaft, empfohlen)
1. Neues GitHub-Repository erstellen, Inhalt dieses Ordners hochladen
2. Repo-Einstellungen → Pages → Branch `main`, Ordner `/root` auswählen
3. Nach ein bis zwei Minuten ist die App unter `https://DEINUSERNAME.github.io/REPONAME/` erreichbar

### Option C — Lokal testen (nur auf dem eigenen Rechner, gleiches WLAN wie Handy)
```
cd pwa
python3 -m http.server 8080
```
Dann auf dem Handy im gleichen WLAN `http://DEINE-COMPUTER-IP:8080` öffnen (IP z. B. via `ipconfig`/`ifconfig` herausfinden). Für echtes HTTPS/Installierbarkeit reicht das langfristig nicht — nutzt für die Reise Option A oder B.

## App installieren (auf dem Handy, nach dem Hosting)

- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → "Zum Home-Bildschirm"
- **Android (Chrome):** Seite öffnen → Menü (⋮) → "App installieren" bzw. "Zum Startbildschirm hinzufügen"

Danach startet die App wie eine normale App vom Homescreen, ohne Browser-Adressleiste.

## Was die App kann

- **Übersicht:** Tage-Zähler (Startdatum in den Einstellungen setzen), Fortschritt, aktuelle Region frei wählbar
- **Karte:** Alle Spots aus `data/data.js` als farbige Marker (🌿 Natur / 🍷 Genuss / 🏛️ Kultur / 🚐 Camping), nach Kategorie filterbar, Route pro Region als gepunktete Linie
- **Standort & Navigation:** 📍-Button zeigt euren Live-Standort auf der Karte. Aus jedem Spot heraus berechnet "Route berechnen" Distanz & Fahrzeit direkt in der App (kostenlos über OSRM, kein API-Key) und zeichnet die Route auf der Karte ein. Für gesprochene Turn-by-Turn-Navigation öffnet "Karten-App ↗" Google Maps mit Zielführung.
- **Regionen:** Aufklappbare Liste aller 14 Regionen mit Spots; jeder Spot lässt sich überspringen/reaktivieren, ohne dass ihr die Gesamtplanung verliert
- **Spot-Detail:** Beschreibung, Koordinaten, Kosten, Zufahrt, Ausstattung, 5-Tage-Wettervorhersage
- **Bewertung & Notizen:** Sterne, Freitext, Fotos (aus der Kamera/Galerie) — landen automatisch im Tagebuch
- **Tagebuch:** Alle bewerteten/kommentierten Spots an einem Ort
- **Export:** In den Einstellungen könnt ihr alle Daten als JSON-Datei sichern (Backup, da alles nur lokal auf dem Gerät gespeichert wird)

### Zur Navigation im Detail

Echte gesprochene Turn-by-Turn-Navigation (wie Google/Apple Maps) direkt in einer selbstgebauten
PWA nachzubauen ist technisch nicht sinnvoll machbar — es bräuchte kontinuierliches GPS-Tracking
im Hintergrund, Sprachausgabe und Kartenmaterial mit Straßenrouting, und iOS bremst PWAs im
Hintergrund stark aus. Der pragmatische Mittelweg, den die App nutzt:
1. **In der App:** Route, Distanz und Fahrzeit werden direkt angezeigt (nützlich für die Planung,
   "lohnt sich der Umweg?"), über den kostenlosen OSRM-Dienst, ganz ohne Account.
2. **Für die eigentliche Fahrt:** Ein Klick auf "Karten-App ↗" übergibt das Ziel an Google Maps
   (oder auf dem iPhone an Apple Maps, falls als Standard eingestellt) für die gewohnte,
   gesprochene Navigation.

## Woher die Daten kommen — "Kerndaten" vs. "ergänzt"

Jeder Spot in `data/data.js` hat ein Feld `source`:
- `"core"` — Kerninhalte aus unseren gemeinsamen Chats (Region, Beschreibung, Grundfakten)
- `"enriched"` — von Claude recherchiert/ergänzt: Pincamp-Stellplatzempfehlungen (Kategorie
  Camping 🚐), Michelin-Restaurants 2026 und Falstaff-Top-Winzer (beide Kategorie Genuss 🍷)

In der App ist das als Badge sichtbar ("📋 Kerndaten" bzw. "✨ von Claude ergänzt").

**Vollständig eingebaut (Stand dieser Version, 149 Spots gesamt):**
- **22 Pincamp-Stellplätze** über alle 14 Regionen verteilt
- **Alle 53 aktuellen Michelin-Sterne-Restaurants Portugal 2026** (Festland, ohne Madeira -
  keine Camper-Verbindung), jeweils der geografisch nächstgelegenen Region zugeordnet. Manche
  liegen etwas abseits der direkten Route (z. B. Bragança, Almancil) — extra gekennzeichnet
  als Umweg-Option, damit ihr selbst entscheiden könnt
- **Falstaff-Top-Weingüter** entlang der Route (Douro, Alentejo, Vinho Verde, Bairrada)

Da ihr ausdrücklich "alles als Option" wolltet, sind das bewusst *alle* gefundenen Einträge und
nicht nur eine Vorauswahl — nutzt die Kategorie-Filter auf der Karte/in den Regionen, um euch
nur "Genuss" anzeigen zu lassen und daraus spontan auszuwählen.

**Wichtige Einschränkung:** Eine *automatische Live-Anbindung an Park4Night* ist technisch
nicht möglich — Park4Night bietet keine öffentliche Schnittstelle. Die Pincamp-Empfehlungen
wurden daher manuell recherchiert; Preise/Ausstattung vor der Reise noch einmal auf
Park4Night oder Pincamp gegenchecken, da sich das ändern kann.
- **Wetter** ist live integriert (Open-Meteo, kostenlos, kein API-Key nötig, 5-Tage-Vorhersage pro Spot)

## Weitere öffentliche Datenquellen, die sich noch einbauen ließen

Auf Anfrage recherchiere und ergänze ich gerne auch:
- **Rota Vicentina** (offizielle Wanderweg-Seite) — exakte Etappen, Distanzen, Schwierigkeitsgrade für Region 7 *(bewusst nicht recherchiert, da explizit ohne Wanderwege gewünscht)*

## Bereits recherchiert und eingebaut (2. Ausbaustufe)

- **Aldeias Históricas de Portugal** (offizielles Netzwerk der 12 historischen Dörfer): Alle 12
  Dörfer sind jetzt in Region 14 als Spots erfasst (Monsanto war schon drin, 8 weitere neu:
  Trancoso, Castelo Rodrigo, Linhares da Beira, Sortelha, Belmonte, Piódão, Idanha-a-Velha,
  Marialva). Quelle: aldeiashistoricasdeportugal.com
- **Offizielle Weinrouten** (Rota dos Vinhos do Douro/Alentejo/Vinho Verde): weitere Top-Weingüter
  ergänzt — Cartuxa & die offizielle CVRA-Verkostungsstube in Évora sowie João Portugal Ramos und
  Adega Mayor im Alentejo; Quinta da Pacheca (Übernachtung im Weinfass!) und Quinta do Bomfim im
  Douro-Tal
- **Vias Verdes / Maut-Übersicht**: konkrete Kosten pro Hauptstrecke (A1, A2) und Hinweis, welche
  Autobahnen seit 2025 mautfrei sind (u. a. die komplette A22 an der Algarve) — zu finden in den
  Einstellungen unter "Praktische Infos"
- **IPMA** (portugiesischer Wetterdienst): als Link zu den offiziellen Wetterwarnungen in den
  Einstellungen ergänzt. Bewusst *nicht* als zweite Live-Wetterintegration in der App verbaut —
  die IPMA-API arbeitet mit Gemeinde-IDs statt Koordinaten und mit ungewisser CORS-Freigabe für
  Browser-Zugriffe, das Risiko eines stillen Fehlschlags wäre höher als der Mehrwert gegenüber
  Open-Meteo. Der Link zu den offiziellen Warnungen (Sturm, Hitze, Starkregen) ist trotzdem
  nützlich und wurde ergänzt
- **campercontact.com**: als Link für eine unabhängige Zweitmeinung zu Stellplätzen ergänzt
  (Einstellungen), nicht einzeln nachrecherchiert, da Pincamp bereits die Region flächendeckend abdeckt

## Route/Spots erweitern oder ändern

Alles befindet sich in **einer Datei**: `data/data.js`. Jede Region ist ein Objekt mit
`spots`-Array. Einfach nach dem bestehenden Muster einen neuen Spot-Eintrag ergänzen
(id, name, lat, lon, category, cost, access, description, amenities, source) — die App
liest die Daten beim Start automatisch neu ein, kein Programmieren nötig.

## Offline-Verhalten im Detail

- App-Grundgerüst (HTML/CSS/JS/Icons/Routendaten) wird beim ersten Laden gecacht → App
  startet danach auch ohne Verbindung
- Kartenkacheln werden gecacht, sobald sie einmal geladen wurden (bereits angeschaute
  Kartenausschnitte bleiben offline sichtbar, neue/nicht besuchte Bereiche nicht)
- Wettervorhersagen werden pro Spot 3 Stunden lokal zwischengespeichert; offline wird
  automatisch die letzte gespeicherte Vorhersage angezeigt (mit Hinweis "aus Cache")
- Bewertungen, Notizen und Fotos funktionieren komplett offline (lokal im Browser
  gespeichert, kein Server nötig)

## Technische Hinweise

- Kein Build-Schritt, kein Framework — reines HTML/CSS/JavaScript, läuft in jedem
  modernen mobilen Browser
- Karte: Leaflet.js + OpenStreetMap (kostenlos, keine Nutzungsgrenzen im normalen Rahmen)
- Wetter: Open-Meteo API (kostenlos, kein Account/API-Key nötig)
- Speicherung: `localStorage` im Browser des Geräts — nichts wird an einen Server gesendet
