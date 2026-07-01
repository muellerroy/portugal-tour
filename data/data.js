// Basisdaten der Portugal Camper-Route
// source: "core" = vom Nutzer/Buch geliefert, "enriched" = von Claude recherchiert/ergänzt
// Diese Datei ist die einzige Stelle, an der die Reiseinhalte gepflegt werden.

const TRIP_DATA = {
  title: "Portugal Camper-Tour",
  totalDays: 28,
  startDate: null, // wird vom Nutzer in den Einstellungen gesetzt (ISO-String)
  regions: [
    {
      id: "r01",
      order: 1,
      name: "Lissabon",
      timeframeDays: 2,
      summary: "Camper-Abholung, Start & Ende der Reise.",
      color: "#1B4F72",
      spots: [
        { id: "s0101", name: "Belém (Jerónimos-Kloster, Torre de Belém)", lat: 38.6979, lon: -9.2062, category: "kultur", cost: "Kloster/Turm Eintritt ca. 10€, Außenbesichtigung frei", access: "Gut ausgeschilderte Parkplätze/Camper-Stellplätze in Belém", description: "UNESCO-Weltkulturerbe im manuelinischen Stil. Pastéis de Belém direkt gegenüber probieren.", amenities: "Parkplatz, Toiletten, Cafés", source: "core" },
        { id: "s0102", name: "LX Factory", lat: 38.7036, lon: -9.1783, category: "kultur", cost: "Eintritt frei, Konsum kostet", access: "Unter der Ponte 25 de Abril, begrenzte Parkplätze", description: "Ehemaliges Fabrikgelände mit Läden, Cafés, Streetart.", amenities: "Restaurants, WC, Wifi in Cafés", source: "core" },
        { id: "s0103", name: "Time Out Market", lat: 38.7069, lon: -9.1459, category: "genuss", cost: "Je nach Stand, ca. 8-15€/Gericht", access: "Cais do Sodré, Fußweg vom Zentrum", description: "Markthalle mit Ständen bekannter Lissabonner Köche.", amenities: "Sitzplätze, WC", source: "core" },
        { id: "s0104", name: "Miradouro da Graça", lat: 38.7169, lon: -9.1306, category: "natur", cost: "kostenlos", access: "Steile Gassen, kein Parkplatz direkt am Ort", description: "Aussichtspunkt über die Alfama und den Tejo.", amenities: "Kiosk-Bar", source: "core" },
        { id: "s0105", name: "Stellplatz Alcochete/Montijo Umgebung", lat: 38.7550, lon: -8.9750, category: "camping", cost: "ca. 10-15€/Nacht (bitte vor Ort prüfen)", access: "Über die Vasco-da-Gama-Brücke günstig erreichbar", description: "Günstigere Alternative zu Innenstadt-Stellplätzen, gute Anbindung nach Lissabon.", amenities: "unbestätigt - vor Abfahrt auf Park4Night prüfen", source: "enriched" },
        { id: "s0106", name: "Belcanto (José Avillez)", lat: 38.7103, lon: -9.1420, category: "genuss", cost: "Degustationsmenü ca. 195-230€", access: "Rua Serpa Pinto 10A, Chiado - Parkhäuser in der Nähe", description: "2 Michelin-Sterne. José Avillez holt die portugiesische Küche ins 21. Jahrhundert - zeitgenössische Gerichte mit Rückbezug auf Tradition.", amenities: "Reservierung Monate im Voraus empfohlen", source: "enriched" },
        { id: "s0107", name: "Fifty Seconds (Rui Silvestre)", lat: 38.7631, lon: -9.0967, category: "genuss", cost: "Degustationsmenü ca. 195-260€", access: "Torre Vasco da Gama, Parque das Nações", description: "2 Michelin-Sterne (neu 2026). 120 m über dem Tejo, \"Reise um die Welt\" von Chef Rui Silvestre - benannt nach der Aufzugsfahrzeit.", amenities: "Reservierung nötig, Dresscode", source: "enriched" },
        { id: "s0108", name: "SÁLA de João Sá", lat: 38.7098, lon: -9.1358, category: "genuss", cost: "Menü ca. 90-140€", access: "Rua dos Bacalhoeiros 103, Baixa", description: "1 Michelin-Stern. Internationale, traditionsbewusste Küche mit dem Besten aus Meer, Wald und Feld Portugals.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0109", name: "100 Maneiras (Ljubomir Stanišić)", lat: 38.7156, lon: -9.1450, category: "genuss", cost: "Degustationsmenü ca. 95-120€", access: "Rua do Teixeira 39, Bairro Alto", description: "Falstaff 93 Punkte. Wilde, moderne und sehr geschmackvolle Küche des bosnisch-portugiesischen Kochs Ljubomir Stanišić.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0110", name: "Encanto (José Avillez, vegetarisch)", lat: 38.7128, lon: -9.1425, category: "genuss", cost: "Menü ca. 75-95€", access: "Largo de São Carlos 10, Chiado", description: "1 Michelin-Stern. Rein vegetarische Küche von Starkoch José Avillez, ausgewogen genug auch für Fleischfans.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0111", name: "2Monkeys (Vítor Matos & Francisco Quintas)", lat: 38.722, lon: -9.1447, category: "genuss", cost: "Menü ca. 90-130€", access: "Rua Câmara Pestana 45, Torel Palace", description: "1 Michelin-Stern. Nur 12 Gästeplätze im ehemaligen Weinkeller, offene Küche.", amenities: "Reservierung Wochen im Voraus", source: "enriched" },
        { id: "s0112", name: "Cura", lat: 38.7231, lon: -9.1567, category: "genuss", cost: "Menü ca. 90-130€", access: "Rua Rodrigo da Fonseca 88", description: "1 Michelin-Stern. Leichte, zeitgenössische Küche aus regionalen Zutaten, auch vegetarisches Menü.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0113", name: "Eleven", lat: 38.7241, lon: -9.1583, category: "genuss", cost: "Menü ca. 120-160€", access: "Rua Marquês de Fronteira, Jardim Amália Rodrigues", description: "1 Michelin-Stern. Weitblick über den Park, Küche von Kaviar bis Hummer.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0114", name: "EPUR", lat: 38.7095, lon: -9.144, category: "genuss", cost: "Menü ca. 90-130€", access: "Lissabon Zentrum", description: "1 Michelin-Stern. Kreative Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0115", name: "Feitoria", lat: 38.6975, lon: -9.2058, category: "genuss", cost: "Menü ca. 110-150€", access: "Altis Belém Hotel", description: "1 Michelin-Stern. Moderne Küche direkt am Tejo bei Belém.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0116", name: "Grenache", lat: 38.7105, lon: -9.1435, category: "genuss", cost: "Menü ca. 90-130€", access: "Lissabon Zentrum", description: "1 Michelin-Stern. Französisch-zeitgenössische Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0117", name: "Henrique Sá Pessoa", lat: 38.7089, lon: -9.1424, category: "genuss", cost: "Menü ca. 90-130€", access: "Lissabon Zentrum", description: "1 Michelin-Stern. Kreative Küche des bekannten portugiesischen Fernsehkochs.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0118", name: "Kabuki Lisboa", lat: 38.7218, lon: -9.1565, category: "genuss", cost: "Menü ca. 110-150€", access: "Rua Castilho 77B, Four Seasons Ritz", description: "1 Michelin-Stern, Falstaff 94 Punkte. Japanisch-mediterrane Küche mit viel Seafood.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0119", name: "Kanazawa", lat: 38.7115, lon: -9.1502, category: "genuss", cost: "Menü ca. 90-140€", access: "Lissabon Zentrum", description: "1 Michelin-Stern. Japanische Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0120", name: "Loco", lat: 38.7085, lon: -9.1548, category: "genuss", cost: "Menü ca. 110-150€", access: "Lissabon Zentrum", description: "1 Michelin-Stern. Moderne Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0121", name: "Marlene", lat: 38.7075, lon: -9.1395, category: "genuss", cost: "Menü ca. 90-130€", access: "Lissabon Zentrum, nahe Cais do Sodré", description: "1 Michelin-Stern. Moderne Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0122", name: "YŌSO", lat: 38.714, lon: -9.146, category: "genuss", cost: "Menü ca. 90-140€", access: "Lissabon Zentrum", description: "1 Michelin-Stern. Japanische Küche.", amenities: "Reservierung empfohlen", source: "enriched" }
      ]
    },
    {
      id: "r02",
      order: 2,
      name: "Lissabon-Umgebung (Sintra, Cascais, Setúbal-Halbinsel)",
      timeframeDays: 2,
      summary: "Königsschlösser, Atlantikklippen und die älteste Korkeiche der Welt.",
      color: "#1B4F72",
      spots: [
        { id: "s0201", name: "Palácio Nacional da Pena", lat: 38.7876, lon: -9.3906, category: "kultur", cost: "Eintritt ca. 14-20€", access: "Serpentinenstraße, besser mit Bus/Tuk-Tuk ab Sintra-Zentrum", description: "Romantisches Königsschloss, UNESCO-Kulturlandschaft seit 1995.", amenities: "Parkplatz (begrenzt), Café", source: "core" },
        { id: "s0202", name: "Cabo da Roca", lat: 38.7811, lon: -9.4986, category: "natur", cost: "kostenlos", access: "Gut ausgebaute Straße, großer Parkplatz", description: "Westlichster Festlandpunkt Europas, archaische Klippenlandschaft.", amenities: "Parkplatz, Kiosk, WC", source: "core" },
        { id: "s0203", name: "Cascais Altstadt", lat: 38.6979, lon: -9.4215, category: "kultur", cost: "kostenlos", access: "Küstenstraße N247 von Lissabon", description: "Mondäne Architektur, einstiger Sommersitz der Königsfamilie, Festung Cidadela.", amenities: "Parkplätze, Restaurants", source: "core" },
        { id: "s0204", name: "Palácio Nacional de Mafra", lat: 38.9370, lon: -9.3327, category: "kultur", cost: "Eintritt ca. 6-10€", access: "Gute Zufahrt, Parkplatz am Palast", description: "Riesiges Barockkloster mit berühmter Bibliothek, UNESCO seit 2019.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s0205", name: "Cabo Espichel", lat: 38.4147, lon: -9.2172, category: "natur", cost: "kostenlos", access: "Ruhige Landstraße ab Sesimbra", description: "30 m hohe Klippen, Vogelparadies, barocke Klosteranlage.", amenities: "Parkplatz, kein WC", source: "core" },
        { id: "s0206", name: "Sobreiro Monumental (größte Korkeiche der Welt)", lat: 38.5167, lon: -8.6333, category: "natur", cost: "kostenlos", access: "Nähe Águas de Moura", description: "Guinness-Rekordbaum, gepflanzt 1783, liefert bis heute jährlich Kork.", amenities: "keine", source: "core" },
        { id: "s0207", name: "LAB by Sergi Arola", lat: 38.7876, lon: -9.3906, category: "genuss", cost: "Menü ca. 120-160€", access: "Hotel Penha Longa, bei Sintra", description: "1 Michelin-Stern. Kreative Küche des katalanischen Sternekochs Sergi Arola.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0208", name: "Fortaleza do Guincho", lat: 38.7317, lon: -9.4744, category: "genuss", cost: "Menü ca. 140-190€", access: "Praia do Guincho, direkt an der Festung", description: "1 Michelin-Stern. Moderne Küche mit spektakulärem Atlantikblick in historischer Festung.", amenities: "Reservierung nötig", source: "enriched" },
        { id: "s0209", name: "Kappo", lat: 38.6979, lon: -9.4215, category: "genuss", cost: "Menü ca. 100-150€", access: "Cascais Zentrum", description: "1 Michelin-Stern (neu 2026). Japanische Kappo-Küche in Cascais.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0210", name: "Camping ORBITUR Guincho", lat: 38.7350, lon: -9.4700, category: "camping", cost: "ca. 15-30€/Nacht", access: "Direkt an der Praia do Guincho, gut ausgeschildert", description: "Pincamp-Empfehlung: beliebter Küstenstellplatz nahe Cascais/Sintra, guter Ausgangspunkt für die Region.", amenities: "Sanitär, Strom, teils Restaurant/Shop - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r03",
      order: 3,
      name: "Alentejo-Inland (Évora & Umgebung)",
      timeframeDays: 3,
      summary: "Römisches Erbe, Megalithen und Marmorstädte im Herzen des Alentejo.",
      color: "#C1602A",
      spots: [
        { id: "s0301", name: "Évora Altstadt", lat: 38.5714, lon: -7.9135, category: "kultur", cost: "kostenlos, Kathedrale/Kapelle je ca. 3-5€", access: "Camper-Parkplätze außerhalb der Altstadtmauer", description: "UNESCO-Weltkulturerbe, Römischer Tempel, Capela dos Ossos.", amenities: "Parkplätze, Restaurants, WC", source: "core" },
        { id: "s0302", name: "Cromeleque dos Almendres", lat: 38.5578, lon: -8.0525, category: "natur", cost: "kostenlos", access: "Letztes Stück unbefestigte Straße", description: "Megalithischer Steinkreis, älter als Stonehenge.", amenities: "keine", source: "core" },
        { id: "s0303", name: "Arraiolos", lat: 38.7186, lon: -7.9884, category: "kultur", cost: "kostenlos, Teppichateliers variieren", access: "Gute Straße ab Évora", description: "Berühmt für handgestickte Teppiche seit dem 15./16. Jahrhundert.", amenities: "Parkplatz, Cafés", source: "core" },
        { id: "s0304", name: "Monsaraz", lat: 38.4400, lon: -7.3789, category: "kultur", cost: "kostenlos", access: "Parkplatz vor dem Ortseingang, autofrei im Kern", description: "Mittelalterliches Dorf mit Burg über dem Alqueva-Stausee.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0305", name: "Vila Viçosa - Paço Ducal", lat: 38.7778, lon: -7.4197, category: "kultur", cost: "Eintritt ca. 6€", access: "Gute Zufahrt, Parkplatz am Palast", description: "Herzogliche Marmorresidenz der Bragança-Familie.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s0306", name: "Elvas", lat: 38.8807, lon: -7.1622, category: "kultur", cost: "kostenlos, Museu Militar ca. 2€", access: "Grenznahe Stadt, gute Zufahrt", description: "UNESCO-Festungsstadt, größtes Bollwerk Europas.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0307", name: "Marvão", lat: 39.3958, lon: -7.3778, category: "kultur", cost: "kostenlos", access: "Kurvige Bergstraße, Parkplatz vor dem Ort", description: "Erhabene Bergfestung auf 800 m, eines der schönsten Dörfer Portugals.", amenities: "Parkplatz", source: "core" },
        { id: "s0308", name: "Alqueva-Stausee / Sternenpark", lat: 38.1667, lon: -7.5000, category: "natur", cost: "kostenlos, geführte Sternentouren kostenpflichtig", access: "Mehrere Zugänge rund um den See", description: "Größter Stausee Westeuropas, zertifizierter Sternenpark.", amenities: "variiert je nach Zugang", source: "core" },
        { id: "s0309", name: "Camping Orbitur Évora", lat: 38.5544, lon: -7.9394, category: "camping", cost: "ca. 15-25€/Nacht", access: "Ausgeschildert ab Évora-Zentrum", description: "Pincamp-Empfehlung: 2 km vom Zentrum, 110 Stellplätze, Pool, Mini-Markt, Snack-Bar - guter Ausgangspunkt für Tagesausflüge ins Alentejo-Inland.", amenities: "Sanitär, Strom, Pool, Wifi (Rezeption), Entsorgungsstation", source: "enriched" },
        { id: "s0310", name: "Herdade do Esporão (Reguengos de Monsaraz)", lat: 38.4103, lon: -7.5350, category: "genuss", cost: "Menü ca. 100-140€, Weinprobe ab ca. 20€", access: "Nahe Monsaraz, gut ausgeschildert", description: "1 Michelin-Stern + Grüner Stern. Weingut mit Restaurant von Chef Carlos Teixeira, nachhaltige Küche direkt zwischen den Weinbergen.", amenities: "Parkplatz, Weinverkostung, Shop", source: "enriched" },
        { id: "s0311", name: "A Cozinha do Paço (Évora)", lat: 38.5714, lon: -7.9135, category: "genuss", cost: "Menü ca. 90-130€", access: "Évora Zentrum", description: "1 Michelin-Stern + Grüner Stern. Chef Afonso Dantas, kreative Küche mit Fokus auf regionale, nachhaltige Zutaten des Alentejo.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0312", name: "MAPA (Montemor-o-Novo)", lat: 38.6486, lon: -8.2181, category: "genuss", cost: "Menü ca. 90-120€", access: "Montemor-o-Novo, auf dem Weg Lissabon-Évora", description: "1 Michelin-Stern. Chef David Jesus, zeitgenössische Alentejo-Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0313", name: "Adega Monte Branco (Estremoz)", lat: 38.8420, lon: -7.5900, category: "genuss", cost: "Weinprobe ab ca. 15-25€", access: "Nähe Estremoz", description: "Falstaff-gelistetes Weingut, typische Alentejo-Weine in der Region rund um Estremoz/Évora.", amenities: "Verkostungsraum, Shop - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s0314", name: "Adega Portalegre (nahe Marvão/Castelo de Vide)", lat: 39.2967, lon: -7.4300, category: "genuss", cost: "Weinprobe ab ca. 15€", access: "Portalegre, guter Umweg von Marvão", description: "Falstaff-gelistetes Weingut in der Region Portalegre - passt gut auf dem Weg zu/von Marvão.", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s0315", name: "Cartuxa (Évora)", lat: 38.575, lon: -7.935, category: "genuss", cost: "Weinprobe ab ca. 12-20€", access: "Évora, an der offiziellen Rota dos Vinhos do Alentejo", description: "Traditionsreiches Weingut in Évora, bekannt für den legendären Pêra-Manca. Teil der offiziellen Alentejo-Weinroute.", amenities: "Verkostungsraum, Shop - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s0316", name: "Rota dos Vinhos do Alentejo - Sala de Provas (Évora)", lat: 38.5719, lon: -7.9067, category: "genuss", cost: "Verkostung ca. 5€", access: "Évora Altstadt", description: "Offizielle Verkostungsstube der Alentejo-Weinroute (CVRA) mitten in Évora - guter Startpunkt, um Empfehlungen für die ganze Region zu bekommen.", amenities: "Kein Termin nötig, täglich geöffnet", source: "enriched" },
        { id: "s0317", name: "João Portugal Ramos Winery (Estremoz)", lat: 38.8378, lon: -7.5847, category: "genuss", cost: "Weinprobe & Tour ab ca. 15€", access: "Estremoz", description: "Bekanntes Weingut der Alentejo-Weinroute mit Weinbergsführungen und Verkostung.", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s0318", name: "Adega Mayor (Campo Maior, nahe Elvas)", lat: 39.0186, lon: -7.0722, category: "genuss", cost: "Weinprobe & Tour ab ca. 15€", access: "Campo Maior, kleiner Umweg nördlich von Elvas", description: "Architektonisch markantes Weingut (Bau von Álvaro Siza) an der Alentejo-Weinroute.", amenities: "Verkostungsraum, moderne Architektur - vorherige Anmeldung empfohlen", source: "enriched" }
      ]
    },
    {
      id: "r04",
      order: 4,
      name: "Alentejo Süden / Guadiana-Tal",
      timeframeDays: 2,
      summary: "Maurisches Erbe, stillgelegter Bergbau und der seltene Iberische Luchs.",
      color: "#C1602A",
      spots: [
        { id: "s0401", name: "Mértola", lat: 37.6392, lon: -7.6636, category: "kultur", cost: "kostenlos, Burgmuseum ca. 2€", access: "Hügelige Zufahrt, Parkplatz am Ortsrand", description: "Maurisches Erbe, Burg, alle 2 Jahre Festival Islâmico.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0402", name: "Mina de São Domingos", lat: 37.6667, lon: -7.5000, category: "kultur", cost: "Außengelände frei zugänglich", description: "Stillgelegte Bergbaustadt mit 2000 Jahren Geschichte, türkisfarbener See.", access: "Unweit der spanischen Grenze", amenities: "kaum Infrastruktur", source: "core" },
        { id: "s0403", name: "Parque Natural do Vale do Guadiana - Pulo do Lobo", lat: 37.7333, lon: -7.6167, category: "natur", cost: "kostenlos", access: "Letztes Stück Schotterstraße", description: "Wasserfall im Naturpark, Lebensraum des vom Aussterben bedrohten Iberischen Luchses.", amenities: "keine", source: "core" },
        { id: "s0404", name: "Serpa", lat: 37.9464, lon: -7.5964, category: "kultur", cost: "kostenlos", access: "Gute Zufahrt", description: "Zentrum des Cante Alentejano (UNESCO-Kulturerbe), traditioneller Chorgesang.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0405", name: "Camping Markádia (Alvito, Barragem de Odivelas)", lat: 38.2544, lon: -8.0664, category: "camping", cost: "ca. 12-20€/Nacht", access: "Etwas nördlich der Route, direkt am Stausee Odivelas", description: "Pincamp-Empfehlung im Alentejo, ruhig direkt am Stausee gelegen - Alternative, falls ihr etwas weiter nördlich übernachten wollt.", amenities: "Sanitär, Strom, Seezugang - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r05",
      order: 5,
      name: "Algarve Ostküste (Tavira, Faro, Ria Formosa)",
      timeframeDays: 2,
      summary: "Lagunenlandschaft, Flamingos und maurische Brücken.",
      color: "#4C7A5E",
      spots: [
        { id: "s0501", name: "Naturpark Ria Formosa (Bootsfahrt)", lat: 37.0200, lon: -7.9200, category: "natur", cost: "Bootsfahrt ca. 15-25€", access: "Boote ab Faro oder Olhão", description: "Flamingos, seltenes Purpurhuhn, Lagunenlandschaft.", amenities: "variiert je nach Anbieter", source: "core" },
        { id: "s0502", name: "Ilha de Tavira / Praia do Barril", lat: 37.1167, lon: -7.6167, category: "natur", cost: "Mini-Zug ca. 2€, Fähre ca. 2€", access: "Per Boot ab Tavira oder Mini-Zug ab Pedras de El-Rei", description: "Dünenstrand, Cemitério das Âncoras (Ankerfriedhof).", amenities: "Strandbars, WC", source: "core" },
        { id: "s0503", name: "Tavira Altstadt", lat: 37.1257, lon: -7.6489, category: "kultur", cost: "kostenlos", access: "Camper-Parkplätze am Stadtrand", description: "Siebenbogige Römische Brücke, maurische Burg.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0504", name: "Cacela Velha", lat: 37.1667, lon: -7.5333, category: "natur", cost: "kostenlos", access: "Kleiner Parkplatz am Ortseingang", description: "Aussichtspunkt über die Ria Formosa, Austern in der Casa da Igreja.", amenities: "kleines Café", source: "core" },
        { id: "s0505", name: "Faro Altstadt", lat: 37.0194, lon: -7.9304, category: "kultur", cost: "Capela dos Ossos ca. 3.50€", access: "Parkhäuser am Stadtrand", description: "Kathedrale, Capela dos Ossos (Knochenkapelle aus 1000 Skeletten).", amenities: "Parkhaus, Restaurants", source: "core" },
        { id: "s0506", name: "Mercados de Olhão", lat: 37.0286, lon: -7.8397, category: "genuss", cost: "je nach Einkauf", access: "Parkplätze am Hafen", description: "Historische Fisch- und Markthallen seit 1916.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s0507", name: "Alameda (Faro)", lat: 37.0194, lon: -7.9304, category: "genuss", cost: "Menü ca. 90-130€", access: "Faro Zentrum", description: "1 Michelin-Stern. Chef Rui Sequeira, moderne Küche in der Algarve-Hauptstadt.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0508", name: "A Ver Tavira", lat: 37.1257, lon: -7.6489, category: "genuss", cost: "Menü ca. 90-120€", access: "Tavira, Blick über die Altstadt", description: "1 Michelin-Stern. Moderne Küche mit Panoramablick über Tavira.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0509", name: "Camping Ria Formosa (Cabanas de Tavira)", lat: 37.1394, lon: -7.6103, category: "camping", cost: "ca. 13-23€/Nacht", access: "Über die N125 Richtung Conceição/Cabanas ausgeschildert", description: "Pincamp-Empfehlung: 6 Hektar direkt am Naturpark Ria Formosa, Pool, Restaurant, 15 Gehminuten zum Strand, gute Zuganbindung nach Tavira.", amenities: "Sanitär, Strom, Pool, Restaurant, Minimarkt, Wifi, Entsorgungsstation", source: "enriched" }
      ]
    },
    {
      id: "r06",
      order: 6,
      name: "Algarve Westküste (Lagos, Sagres, Felsalgarve)",
      timeframeDays: 3,
      summary: "Grotten, Klippenwanderungen und der Sonnenuntergang am 'Ende der Welt'.",
      color: "#4C7A5E",
      spots: [
        { id: "s0601", name: "Ponta da Piedade", lat: 37.0847, lon: -8.6689, category: "natur", cost: "Bootstour ca. 15-20€, zu Fuß kostenlos", access: "Parkplatz südlich der Altstadt Lagos", description: "Grotten, bizarre Felsformationen, Bootstour ab Lagos.", amenities: "Parkplatz", source: "core" },
        { id: "s0602", name: "Percurso dos Sete Vales Suspensos", lat: 37.0958, lon: -8.4550, category: "natur", cost: "kostenlos", access: "Start Praia de Vale Centeanes bei Carvoeiro", description: "Wanderweg Carvoeiro bis Praia da Marinha und Praia de Benagil, ca. 6 km.", amenities: "keine unterwegs", source: "core" },
        { id: "s0603", name: "Capela de Nossa Senhora da Rocha", lat: 37.0989, lon: -8.3583, category: "kultur", cost: "kostenlos", access: "4 km westlich von Armação de Pêra", description: "Weiße Kapelle auf 40 m hohem Felssporn direkt am Meer.", amenities: "kleiner Parkplatz", source: "core" },
        { id: "s0604", name: "Cabo de São Vicente", lat: 37.0206, lon: -8.9707, category: "natur", cost: "kostenlos", access: "Gute Straße ab Sagres", description: "Klippen, Leuchtturm, bester Sonnenuntergang Portugals.", amenities: "Parkplatz, Imbisswagen", source: "core" },
        { id: "s0605", name: "Fortaleza de Sagres", lat: 37.0058, lon: -8.9366, category: "kultur", cost: "Eintritt ca. 3€", access: "Parkplatz an der Festung", description: "Heinrich der Seefahrer, steinerne 'Windrose'.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s0606", name: "Ocean by Hans Neuner (Porches)", lat: 37.1372, lon: -8.4083, category: "genuss", cost: "Degustationsmenü ca. 195-230€", access: "Alporchinhos bei Porches", description: "2 Michelin-Sterne, Falstaff 97 Punkte. Magischer Atlantikblick, Küche von den Azoren bis Tokio und Mosambik.", amenities: "Reservierung Wochen im Voraus nötig", source: "enriched" },
        { id: "s0607", name: "Vila Joya (Galé/Albufeira)", lat: 37.0836, lon: -8.3169, category: "genuss", cost: "Degustationsmenü ca. 195-230€", access: "Praia da Galé bei Albufeira", description: "2 Michelin-Sterne, Falstaff 97 Punkte. Dieter Koschina seit 1991, kulinarisches Juwel mit Atlantikblick.", amenities: "Reservierung Wochen im Voraus nötig", source: "enriched" },
        { id: "s0608", name: "Bon Bon (Carvoeiro)", lat: 37.0967, lon: -8.4700, category: "genuss", cost: "Menü ca. 120-160€", access: "Carvoeiro Zentrum", description: "1 Michelin-Stern. Chef José Lopes, kreative Küche direkt in Carvoeiro.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0609", name: "Vista (Portimão)", lat: 37.1350, lon: -8.5378, category: "genuss", cost: "Menü ca. 90-130€", access: "Portimão", description: "1 Michelin-Stern. Moderne Küche mit Blick über die Küste bei Portimão.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s0610", name: "Camping ORBITUR Sagres", lat: 37.0244, lon: -8.9269, category: "camping", cost: "ca. 15-30€/Nacht", access: "Ca. 2,5 km von Sagres-Zentrum entfernt", description: "Pincamp-Empfehlung: guter Ausgangspunkt für Cabo de São Vicente und die Surfstrände rund um Sagres.", amenities: "Sanitär, Strom, teils Pool/Shop - vor Ort bestätigen", source: "enriched" },
        { id: "s0611", name: "Camping ORBITUR Valverde (bei Lagos)", lat: 37.1194, lon: -8.7050, category: "camping", cost: "ca. 15-30€/Nacht", access: "Vor den Toren von Lagos an der N125", description: "Pincamp-Empfehlung: weitläufige Anlage mit Pool und Restaurant, ca. 2 km zum Meer, guter Ausgangspunkt für Ponta da Piedade.", amenities: "Sanitär, Strom, Pool, Restaurant, Einkaufsmöglichkeit", source: "enriched" },
        { id: "s0612", name: "Gusto by Heinz Beck (Almancil)", lat: 37.0967, lon: -8.0119, category: "genuss", cost: "Menü ca. 130-170€", access: "Conrad Algarve, Almancil", description: "1 Michelin-Stern. Mediterrane Küche des römischen Sternekochs Heinz Beck, kleiner Umweg Richtung Loulé/Almancil.", amenities: "Reservierung empfohlen", source: "enriched" }
      ]
    },
    {
      id: "r07",
      order: 7,
      name: "Costa Vicentina (Aljezur bis Vila Nova de Milfontes)",
      timeframeDays: 2,
      summary: "Wilde Atlantikküste, Surfspots und der Fischerpfad.",
      color: "#4C7A5E",
      spots: [
        { id: "s0701", name: "Praia da Arrifana", lat: 37.2900, lon: -8.8650, category: "natur", cost: "kostenlos", access: "Steile Zufahrtsstraße", description: "Wilder Surfstrand mit Klippen und Festungsruine.", amenities: "Parkplatz, Strandbar (saisonal)", source: "core" },
        { id: "s0702", name: "Praia de Odeceixe", lat: 37.4300, lon: -8.7658, category: "natur", cost: "kostenlos", access: "Parkplatz oberhalb des Strands", description: "Bezaubernder Strand an der Mündung des Rio Seixe.", amenities: "Parkplatz, Strandbars", source: "core" },
        { id: "s0703", name: "Vila Nova de Milfontes", lat: 37.7256, lon: -8.7825, category: "natur", cost: "kostenlos", access: "Gute Zufahrt, Parkplätze am Ort", description: "Fluss trifft Meer, Forte de São Clemente, Süßwasserstrände.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0704", name: "Cabo Sardão", lat: 37.6014, lon: -8.7986, category: "natur", cost: "kostenlos", access: "Kleine Straße ab Cavaleiro", description: "Schroffe Felsen, Storchenkolonie, Leuchtturm.", amenities: "Parkplatz", source: "core" },
        { id: "s0705", name: "Zambujeira do Mar", lat: 37.5264, lon: -8.7864, category: "natur", cost: "kostenlos", access: "Gute Zufahrt", description: "Klippenstrand mit dramatischer Steilküste.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0706", name: "Parque de Campismo São Miguel (bei Odeceixe)", lat: 37.4400, lon: -8.7500, category: "camping", cost: "ca. 15-25€/Nacht", access: "Ca. 2 km nördlich von Odeceixe, ausgeschildert an der N120", description: "Pincamp-Empfehlung, Rota-Vicentina-Partner: ruhig im Pinienwald, 4 km zu den Stränden Odeceixe/Carvalhal, Wanderweg direkt am Gelände.", amenities: "Sanitär, Strom, kleiner Shop, Restaurant (ab 19 Uhr), Pool", source: "enriched" },
        { id: "s0707", name: "Parque de Campismo do Serrão (bei Aljezur)", lat: 37.3350, lon: -8.7950, category: "camping", cost: "ca. 15-25€/Nacht", access: "Ca. 3 km nördlich von Aljezur, Abzweig von der N120", description: "Pincamp-Empfehlung: familienfreundlicher, schattiger Platz mit guten Bewertungen - Achtung, Wildcampen ist rund um Aljezur/Costa Vicentina streng verboten und wird mit hohen Bußgeldern geahndet.", amenities: "Sanitär, Strom, Restaurant", source: "enriched" },
        { id: "s0708", name: "Camping ORBITUR Sitava Milfontes", lat: 37.7256, lon: -8.7825, category: "camping", cost: "ca. 15-30€/Nacht", access: "Direkt bei Vila Nova de Milfontes", description: "Pincamp-Empfehlung: Pool, gute Lage nahe Strand und Ortszentrum von Vila Nova de Milfontes.", amenities: "Sanitär, Strom, Pool, Restaurant - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r08",
      order: 8,
      name: "Alentejo-Küste & Arrábida (Comporta bis Setúbal)",
      timeframeDays: 1.5,
      summary: "Reisfelder, Pinienwälder und smaragdgrüne Buchten.",
      color: "#4C7A5E",
      spots: [
        { id: "s0801", name: "Comporta", lat: 38.3833, lon: -8.7833, category: "natur", cost: "kostenlos", access: "Gute Straße, begrenzte Parkplätze im Ort", description: "Stelzenwege durch die Dünen, Reisfelder, exklusive Strände.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0802", name: "Tróia-Halbinsel", lat: 38.4867, lon: -8.8917, category: "natur", cost: "Fähre ab Setúbal ca. 5-10€", access: "Per Fähre ab Setúbal oder Landstraße über Comporta", description: "Lange Sandstrände gegenüber von Setúbal.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0803", name: "Naturpark Arrábida - Portinho da Arrábida", lat: 38.4808, lon: -8.9797, category: "natur", cost: "kostenlos, Parkgebühr in Hochsaison", access: "Enge, kurvige Straße, Parkplatzsuche in Hochsaison schwierig", description: "Smaragdgrünes Wasser, Praia do Ribeiro do Cavalo, Galapinhos Beach.", amenities: "Parkplatz (Gebühr), Restaurants", source: "core" },
        { id: "s0804", name: "Camping ORBITUR Costa de Caparica", lat: 38.6350, lon: -9.2250, category: "camping", cost: "ca. 15-30€/Nacht", access: "Direkt an der Costa de Caparica, gut ausgeschildert", description: "Pincamp-Empfehlung: großer, etablierter Küstenstellplatz nahe Lissabon, guter Ausgangspunkt für die Region.", amenities: "Sanitär, Strom, Pool, Shop - vor Ort bestätigen", source: "enriched" },
        { id: "s0805", name: "Camping Lagoa de Santo André", lat: 38.1000, lon: -8.7900, category: "camping", cost: "ca. 12-20€/Nacht", access: "Zwischen Santiago do Cacém und der Küste", description: "Pincamp-Empfehlung: ruhig an der Lagune gelegen, guter Zwischenstopp auf dem Weg von/zur Alentejo-Küste.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r09",
      order: 9,
      name: "Zentrum-Küste (Ericeira bis Nazaré/Óbidos)",
      timeframeDays: 3,
      summary: "Riesenwellen, mittelalterliche Städte und Klosterarchitektur.",
      color: "#1B4F72",
      spots: [
        { id: "s0901", name: "Nazaré - Praia do Norte", lat: 39.6072, lon: -9.0761, category: "natur", cost: "kostenlos", access: "Parkplatz beim Leuchtturm", description: "Weltrekord-Riesenwellen (bis 26 m), berühmter Surfspot.", amenities: "Parkplatz, Aussichtspunkt", source: "core" },
        { id: "s0902", name: "Óbidos", lat: 39.3608, lon: -9.1569, category: "kultur", cost: "kostenlos, Stadtmauer-Begehung frei", access: "Parkplätze vor den Stadtmauern", description: "Mittelalterliche Stadtmauer, Ginjinha in Schokoladenbechern.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0903", name: "Mosteiro da Batalha", lat: 39.6608, lon: -8.8256, category: "kultur", cost: "Eintritt ca. 6€", access: "Parkplatz am Kloster", description: "Gotisches Meisterwerk, UNESCO-Weltkulturerbe seit 1983.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s0904", name: "Mosteiro de Alcobaça", lat: 39.5478, lon: -8.9800, category: "kultur", cost: "Eintritt ca. 6€", access: "Parkplatz im Ortszentrum", description: "Letzte Ruhestätte von Pedro & Inês, UNESCO seit 1989.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s0905", name: "Fátima - Santuário", lat: 39.6308, lon: -8.6725, category: "kultur", cost: "kostenlos", access: "Große Parkplätze am Heiligtum", description: "Bedeutendster Wallfahrtsort Portugals, Marienerscheinung 1917.", amenities: "Parkplatz, WC, Restaurants", source: "core" },
        { id: "s0906", name: "São Martinho do Porto", lat: 39.5158, lon: -9.1358, category: "natur", cost: "kostenlos", access: "Gute Zufahrt", description: "Halbrunde Bucht, ruhiges Atlantikbaden.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s0907", name: "Camping ORBITUR Foz do Arelho", lat: 39.4267, lon: -9.2200, category: "camping", cost: "ca. 15-30€/Nacht", access: "Bei Óbidos, an der Arelho-Lagune", description: "Pincamp-Empfehlung: direkt an der Lagune bei Óbidos, guter Ausgangspunkt für Óbidos und die Silberküste.", amenities: "Sanitär, Strom, teils Pool - vor Ort bestätigen", source: "enriched" },
        { id: "s0908", name: "Camping ORBITUR São Pedro de Moel", lat: 39.7597, lon: -9.0344, category: "camping", cost: "ca. 15-30€/Nacht", access: "Nahe Marinha Grande/Nazaré", description: "Pincamp-Empfehlung: Küstenstellplatz im Pinienwald nahe Nazaré, beliebt bei Wintercampern.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r10",
      order: 10,
      name: "Coimbra & Aveiro",
      timeframeDays: 2,
      summary: "Studentenstadt mit Fado-Tradition und bunte Kanalstadt.",
      color: "#1B4F72",
      spots: [
        { id: "s1001", name: "Coimbra - Biblioteca Joanina", lat: 40.2081, lon: -8.4256, category: "kultur", cost: "Eintritt ca. 12.50€ (Uni-Komplex)", access: "Parkhäuser am Stadtrand, Altstadt bergig", description: "Barocke Bibliothek, UNESCO-Welterbe seit 2013.", amenities: "Parkhaus, Restaurants", source: "core" },
        { id: "s1002", name: "Aveiro Kanäle (Moliceiros-Bootsfahrt)", lat: 40.6405, lon: -8.6538, category: "genuss", cost: "Bootsfahrt ca. 12-15€", access: "Anlegestellen im Zentrum", description: "'Venedig Portugals', bunte Boote, Ovos Moles probieren.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s1003", name: "Costa Nova (gestreifte Häuser)", lat: 40.6011, lon: -8.7472, category: "natur", cost: "kostenlos", access: "Gute Zufahrt ab Aveiro", description: "Ikonische bunt gestreifte Fischerhäuser, Praia da Barra mit höchstem Leuchtturm Portugals.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s1004", name: "Adega Luís Pato (Bairrada, bei Aveiro)", lat: 40.4700, lon: -8.5900, category: "genuss", cost: "Weinprobe ab ca. 15-20€", access: "Amoreira da Gândara, ca. 25 Min. von Aveiro", description: "Falstaff-gelistetes Weingut in der Bairrada-Region, bekannt für Baga-Rotweine und Schaumweine.", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1005", name: "Camping ORBITUR Costa Nova / São Jacinto", lat: 40.6500, lon: -8.7400, category: "camping", cost: "ca. 15-30€/Nacht", access: "Bei Costa Nova bzw. auf der Landzunge São Jacinto, per Fähre oder Straße erreichbar", description: "Pincamp-Empfehlung: Küstenstellplätze nahe der gestreiften Häuser von Costa Nova und der Ria de Aveiro.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r11",
      order: 11,
      name: "Porto & Douro-Tal",
      timeframeDays: 3,
      summary: "Portwein, Azulejos und terrassierte Weinberge.",
      color: "#1B4F72",
      spots: [
        { id: "s1101", name: "Porto - Ribeira & Ponte Luís I", lat: 41.1405, lon: -8.6119, category: "kultur", cost: "kostenlos", access: "Parkhäuser, Altstadt eng und steil", description: "Historisches Flussufer-Viertel, Brücke von Eiffels Schüler erbaut.", amenities: "Parkhaus, Restaurants", source: "core" },
        { id: "s1102", name: "Bahnhof São Bento (Azulejos)", lat: 41.1456, lon: -8.6108, category: "kultur", cost: "kostenlos", access: "Zu Fuß von der Altstadt", description: "Beeindruckende Azulejo-Wandbilder von 1916.", amenities: "keine speziell", source: "core" },
        { id: "s1103", name: "Vila Nova de Gaia - Portwein-Keller", lat: 41.1239, lon: -8.6118, category: "genuss", cost: "Verkostung ca. 10-20€", access: "Über die Ponte Luís I zu Fuß erreichbar", description: "Portwein-Verkostung bei Sandeman, Ferreira oder Porto Cruz.", amenities: "Parkhaus, WC", source: "core" },
        { id: "s1104", name: "Douro-Tal bei Pinhão", lat: 41.1892, lon: -7.5486, category: "natur", cost: "kostenlos, Weinproben variieren", access: "Kurvige Landstraße N222", description: "Älteste offiziell abgegrenzte Weinregion der Welt (seit 1756).", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s1105", name: "Miradouro de Casal de Loivos", lat: 41.1958, lon: -7.5289, category: "natur", cost: "kostenlos", access: "Kleine Bergstraße", description: "Bester Panoramablick über die Douro-Weinterrassen.", amenities: "kleiner Parkplatz", source: "core" },
        { id: "s1106", name: "Pedro Lemos (Porto)", lat: 41.1500, lon: -8.6706, category: "genuss", cost: "Degustationsmenü ca. 140-180€", access: "Foz do Douro, Rua Padre Luís Cabral", description: "1 Michelin-Stern, Falstaff 94 Punkte. Fokus auf die besten Produkte von Meer und Festland Portugals.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1107", name: "The Yeatman (Vila Nova de Gaia)", lat: 41.1358, lon: -8.6136, category: "genuss", cost: "Degustationsmenü ca. 180-220€", access: "Hotel The Yeatman, über der Ponte Luís I", description: "2 Michelin-Sterne, Falstaff 97 Punkte. Chef Ricardo Costa, elegante portugiesische Küche plus preisgekrönte Weinkarte.", amenities: "Reservierung Wochen im Voraus", source: "enriched" },
        { id: "s1108", name: "Antiqvvm (Porto)", lat: 41.1497, lon: -8.6272, category: "genuss", cost: "Degustationsmenü ca. 140-180€", access: "Quinta da Macieirinha, Rua de Entre-Quintas", description: "2 Michelin-Sterne, Falstaff 96 Punkte. Chef Vítor Matos, idyllisch im Park mit Blick auf Douro und Stadt.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1109", name: "Casa de Chá da Boa Nova (Leça da Palmeira)", lat: 41.1911, lon: -8.7011, category: "genuss", cost: "Degustationsmenü ca. 160-220€", access: "Leça da Palmeira, nördlich von Porto direkt am Meer", description: "2 Michelin-Sterne, Falstaff 96 Punkte. Chef Rui Paula, direkt am Atlantik in denkmalgeschütztem Gebäude (Álvaro Siza).", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1110", name: "Schisto (Peso da Régua)", lat: 41.1622, lon: -7.7889, category: "genuss", cost: "Menü ca. 90-130€", access: "Peso da Régua, mitten im Douro-Tal", description: "1 Michelin-Stern (neu 2026). Chefs Vítor Matos & Vítor Gomes, zeitgenössische Küche direkt im Weinbaugebiet.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1111", name: "Largo do Paço (Amarante)", lat: 41.2686, lon: -8.0794, category: "genuss", cost: "Menü ca. 90-130€", access: "Amarante Zentrum", description: "1 Michelin-Stern. Chef Francisco Quintas (Young Chef Award 2026), moderne Küche im historischen Ambiente.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1112", name: "Quinta do Crasto (Sabrosa, Douro)", lat: 41.1856, lon: -7.6106, category: "genuss", cost: "Weinprobe & Tour ab ca. 15-30€", access: "Nahe Sabrosa, spektakuläre Terrassenlage über dem Douro", description: "Falstaff-Top-Weingut. Eines der bekanntesten Weingüter des Douro-Tals mit beeindruckendem Panoramablick.", amenities: "Verkostungsraum, Terrasse, Shop - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1113", name: "Quinta do Vallado (bei Peso da Régua)", lat: 41.1719, lon: -7.7742, category: "genuss", cost: "Weinprobe & Tour ab ca. 15-25€", access: "Vilarinho dos Freires, nahe Peso da Régua", description: "Falstaff-Top-Weingut, eines der ältesten Weingüter des Douro-Tals.", amenities: "Verkostungsraum, Führungen, teils Übernachtung - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1114", name: "W. & J. Graham's Port (Vila Nova de Gaia)", lat: 41.1339, lon: -8.6103, category: "genuss", cost: "Verkostung & Tour ab ca. 15-25€", access: "Vila Nova de Gaia, Portwein-Kellerei-Viertel", description: "Falstaff-Top-Weingut. Traditionsreiche Portwein-Kellerei mit Kellerführung und Verkostung.", amenities: "Führungen, Shop, Aussichtsterrasse", source: "enriched" },
        { id: "s1115", name: "Camping ORBITUR Angeiras / Canidelo", lat: 41.2450, lon: -8.7250, category: "camping", cost: "ca. 15-30€/Nacht", access: "Nördlich bzw. südlich von Porto an der Küste", description: "Pincamp-Empfehlung: Küstenstellplätze mit guter Anbindung an Porto per Bus/Bahn.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" },
        { id: "s1116", name: "Camping Lamego / Municipal Vila Real", lat: 41.0947, lon: -7.8103, category: "camping", cost: "ca. 10-20€/Nacht", access: "Direkt im Douro-Tal, ausgeschildert", description: "Pincamp-Empfehlung: einfache, zentrale Stellplätze im Herzen des Douro-Tals als Alternative zu den Küstenplätzen.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" },
        { id: "s1117", name: "Blind (Vítor Matos, Torel Palace Porto)", lat: 41.1489, lon: -8.6156, category: "genuss", cost: "Menü ca. 120-160€", access: "Torel Palace Porto", description: "1 Michelin-Stern. Von José Saramagos Roman Die Stadt der Blinden inspiriertes Sinneserlebnis.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1118", name: "dop (Rui Paula & Sandro Teixeira)", lat: 41.1443, lon: -8.6119, category: "genuss", cost: "Menü ca. 90-130€", access: "Largo de São Domingos 18, Porto", description: "1 Michelin-Stern (neu 2026). Traditionelle Nordportugal-Küche neu interpretiert.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1119", name: "Éon (Tiago Bonito)", lat: 41.15, lon: -8.61, category: "genuss", cost: "Menü ca. 90-130€", access: "Porto Zentrum", description: "1 Michelin-Stern (neu 2026). Zeitgenössische Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1120", name: "Euskalduna Studio", lat: 41.1495, lon: -8.6017, category: "genuss", cost: "Menü ca. 110-150€", access: "Rua Santo Ildefonso 404, Porto", description: "1 Michelin-Stern, Falstaff 94 Punkte. Chef Vasco Coelho Santos, baskisch inspiriert mit portugiesischen Produkten.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1121", name: "Gastro by Elemento (Ricardo Dias Ferreira)", lat: 41.151, lon: -8.614, category: "genuss", cost: "Menü ca. 90-130€", access: "Porto Zentrum", description: "1 Michelin-Stern (neu 2026). Zeitgenössische Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1122", name: "In Diferente (Angélica Salvador)", lat: 41.152, lon: -8.608, category: "genuss", cost: "Menü ca. 90-130€", access: "Rua Dr. Sousa Rosa, Porto", description: "1 Michelin-Stern (neu 2026). Vierte Frau mit Michelin-Stern in Portugal.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1123", name: "Le Monument (Julien Montbabut)", lat: 41.1495, lon: -8.6103, category: "genuss", cost: "Menü ca. 110-150€", access: "Avenida dos Aliados 151, Porto", description: "1 Michelin-Stern, Falstaff 93 Punkte. Kulinarische Reise durch ganz Portugal.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1124", name: "Vila Foz Restaurante", lat: 41.1544, lon: -8.6753, category: "genuss", cost: "Menü ca. 110-150€", access: "Avenida de Montevideu, Foz do Porto", description: "1 Michelin-Stern, Falstaff 95 Punkte. Elegante Küche mit Fokus auf Fisch und Meeresfrüchte.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1125", name: "Vinha (Vila Nova de Gaia)", lat: 41.1358, lon: -8.6136, category: "genuss", cost: "Menü ca. 90-130€", access: "Vila Nova de Gaia", description: "1 Michelin-Stern. Portugiesische Küche.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1126", name: "Oculto (Vila do Conde)", lat: 41.3524, lon: -8.7444, category: "genuss", cost: "Menü ca. 90-130€", access: "Vila do Conde, ca. 30 Min. nördlich von Porto", description: "1 Michelin-Stern. Moderne Küche, kleiner Umweg an der Küste nördlich von Porto.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1127", name: "Aveleda (Penafiel)", lat: 41.21, lon: -8.305, category: "genuss", cost: "Weinprobe ab ca. 10-15€", access: "Penafiel, ca. 25 Min. von Amarante", description: "Falstaff-Top-Weingut. Bekannter Vinho-Verde-Produzent mit historischem Quinta-Gelände und Gärten.", amenities: "Verkostungsraum, Gartenbesichtigung - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1128", name: "Alves de Sousa (Santa Marta de Penaguião)", lat: 41.1608, lon: -7.7833, category: "genuss", cost: "Weinprobe ab ca. 15€", access: "Douro-Tal, nahe Peso da Régua", description: "Falstaff-Top-Weingut im Herzen des Douro.", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1129", name: "1912Winemakers (Porto)", lat: 41.16, lon: -8.61, category: "genuss", cost: "Weinprobe ab ca. 15€", access: "Porto", description: "Falstaff-gelistetes, junges Weingut/Négociant-Projekt aus Porto.", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1130", name: "Quinta da Pacheca (Lamego)", lat: 41.0928, lon: -7.8115, category: "genuss", cost: "Übernachtung im Weinfass & Verkostung ab ca. 15€", access: "Lamego, Douro-Tal", description: "Ikone der Douro-Weinroute - berühmt für die Möglichkeit, in einem umgebauten Weinfass zu übernachten. Verkostung und Weinbergsführung.", amenities: "Verkostungsraum, Restaurant, Übernachtung im Fass - Anmeldung empfohlen", source: "enriched" },
        { id: "s1131", name: "Quinta do Bomfim (Pinhão)", lat: 41.19, lon: -7.545, category: "genuss", cost: "Weinprobe & Tour ab ca. 15-20€", access: "Pinhão, Douro-Tal", description: "Historisches Symington-Weingut direkt bei Pinhão mit Panoramablick über die Weinterrassen, Teil der offiziellen Rota do Vinho do Porto e Douro.", amenities: "Verkostungsraum, Museum, Führungen - Anmeldung empfohlen", source: "enriched" }
      ]
    },
    {
      id: "r12",
      order: 12,
      name: "Minho-Norden (Braga, Guimarães, Barcelos)",
      timeframeDays: 2,
      summary: "Wiege der Nation, Wallfahrtskirchen und der Hahn von Barcelos.",
      color: "#C1602A",
      spots: [
        { id: "s1201", name: "Guimarães Altstadt", lat: 41.4425, lon: -8.2918, category: "kultur", cost: "kostenlos, Burg ca. 2€", access: "Parkhäuser am Stadtrand", description: "'Wiege der Nation', UNESCO-Weltkulturerbe, Paço dos Duques.", amenities: "Parkhaus, Restaurants", source: "core" },
        { id: "s1202", name: "Bom Jesus do Monte, Braga", lat: 41.5561, lon: -8.3781, category: "kultur", cost: "Standseilbahn ca. 2€, Gelände frei", access: "Parkplatz am Fuß der Treppe", description: "Barocke Wallfahrtskirche, historische Standseilbahn seit 1882.", amenities: "Parkplatz, Restaurants", source: "core" },
        { id: "s1203", name: "Barcelos", lat: 41.5388, lon: -8.6151, category: "kultur", cost: "kostenlos, Markt donnerstags", access: "Gute Zufahrt", description: "Hahn-Legende (Nationalsymbol Portugals), großer Markt seit 1412.", amenities: "Parkplatz", source: "core" },
        { id: "s1204", name: "A Cozinha (Guimarães)", lat: 41.4425, lon: -8.2918, category: "genuss", cost: "Menü ca. 90-130€", access: "Guimarães Altstadt, Largo do Serralho", description: "1 Michelin-Stern. Chef António Loureiro, moderne Küche mit Gemüse aus dem eigenen Stadtgarten.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1205", name: "Palatial (Braga)", lat: 41.5454, lon: -8.4265, category: "genuss", cost: "Menü ca. 80-120€", access: "Arcos, Braga", description: "1 Michelin-Stern. Traditionelle portugiesische Küche mit modernem Touch.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1206", name: "Anselmo Mendes (Vinho Verde)", lat: 41.6800, lon: -8.4500, category: "genuss", cost: "Weinprobe ab ca. 15€", access: "Region Vinho Verde, nahe Ponte de Lima/Braga", description: "Falstaff-Top-Weingut, führender Winzer der Vinho-Verde-Region (Alvarinho-Weine).", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1207", name: "Camping Braga", lat: 41.5454, lon: -8.4265, category: "camping", cost: "ca. 12-20€/Nacht", access: "Nahe Braga-Zentrum", description: "Pincamp-Empfehlung: praktischer Ausgangspunkt für Braga, Guimarães und Barcelos.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" },
        { id: "s1208", name: "Adega Cooperativa de Ponte de Lima", lat: 41.77, lon: -8.5833, category: "genuss", cost: "Weinprobe ab ca. 10€", access: "Ponte de Lima, Viana do Castelo", description: "Falstaff-gelistetes Weingut, genossenschaftlich, typische Vinho-Verde-Weine.", amenities: "Verkostungsraum - vorherige Anmeldung empfohlen", source: "enriched" },
        { id: "s1209", name: "G Pousada (Bragança) - weiter entfernt", lat: 41.8064, lon: -6.7567, category: "genuss", cost: "Menü ca. 90-130€", access: "Bragança, ca. 2 Std. Umweg ab Douro-Tal/Peneda-Gerês", description: "1 Michelin-Stern. Regionale Küche des Nordostens in der Pousada de Bragança - nur bei Zeit/Lust auf großen Umweg.", amenities: "Reservierung empfohlen", source: "enriched" }
      ]
    },
    {
      id: "r13",
      order: 13,
      name: "Peneda-Gerês Nationalpark",
      timeframeDays: 2,
      summary: "Portugals einziger Nationalpark - Granitdörfer und Wasserfälle.",
      color: "#4C7A5E",
      spots: [
        { id: "s1301", name: "Soajo (Espigueiros)", lat: 41.8722, lon: -8.2506, category: "kultur", cost: "kostenlos", access: "Kurvige Bergstraße", description: "Traditionelle Kornspeicher auf Stelzen (Espigueiros), Granitdorf.", amenities: "kleiner Parkplatz", source: "core" },
        { id: "s1302", name: "Lindoso", lat: 41.8631, lon: -8.1969, category: "kultur", cost: "Burg ca. 2€", access: "Nahe der spanischen Grenze", description: "Espigueiros und Burg mit Blick auf den Stausee.", amenities: "Parkplatz", source: "core" },
        { id: "s1303", name: "Pitões das Júnias", lat: 41.8283, lon: -8.0453, category: "natur", cost: "kostenlos", access: "Enge Bergstraße, für große Camper prüfen", description: "Wasserfälle, Naturpools, bekannter Wohnmobil-Stellplatz beim Friedhof.", amenities: "einfacher Stellplatz, kein Strom", source: "core" },
        { id: "s1304", name: "Parque de Campismo da Travanca", lat: 41.9017, lon: -8.3146, category: "camping", cost: "ca. 12-20€/Nacht", access: "Nahe Porta do Mezio, einem der 5 Zugangstore zum Nationalpark", description: "Pincamp-Empfehlung: Waldcampingplatz mit Panoramablick, nahe Badetümpeln (Lagoas da Travanca) und Startpunkt vieler Wanderwege.", amenities: "Sanitär, Strom, Pool (Vergnügungspark Porta do Mezio nebenan)", source: "enriched" },
        { id: "s1305", name: "Parque Cerdeira (Campo do Gerês)", lat: 41.7392, lon: -8.1919, category: "camping", cost: "ca. 15-25€/Nacht", access: "Bei Terras de Bouro, kurvige Bergstraße", description: "Pincamp-Empfehlung: Terrassiges Gelände im Mischwald am Homem-See, 600 m zum Strand, Pool, Restaurant, barrierefrei.", amenities: "Sanitär, Strom, Pool, Restaurant, Shop, Spielplatz", source: "enriched" },
        { id: "s1306", name: "Gerês Vidoeiro Camping (Caldas do Gerês)", lat: 41.7378, lon: -8.1697, category: "camping", cost: "ca. 12-20€/Nacht", access: "Caldas do Gerês, Terras de Bouro", description: "Weitere Pincamp/Community-Empfehlung im Nationalpark, zentral in Caldas do Gerês gelegen.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" }
      ]
    },
    {
      id: "r14",
      order: 14,
      name: "Rückweg über Zentrum (Serra da Estrela, Tomar)",
      timeframeDays: 3,
      summary: "Höchstes Festlandgebirge, historische Dörfer und Templerburgen.",
      color: "#C1602A",
      spots: [
        { id: "s1401", name: "Serra da Estrela (Torre)", lat: 40.3269, lon: -7.6144, category: "natur", cost: "Parkgebühr ca. 2-5€", access: "Kurvenreiche Bergstraße, im Winter ggf. Schneeketten nötig", description: "Höchstes Festlandgebirge Portugals, Wasserfälle, Wollindustrie-Tradition.", amenities: "Parkplatz, Kiosk", source: "core" },
        { id: "s1402", name: "Monsanto", lat: 40.0364, lon: -7.1122, category: "kultur", cost: "kostenlos", access: "Steile, enge Gassen - Camper besser außerhalb parken", description: "'Historischstes Dorf Portugals', Häuser zwischen Felsblöcken.", amenities: "Parkplatz am Ortsrand", source: "core" },
        { id: "s1403", name: "Convento de Cristo, Tomar", lat: 39.6033, lon: -8.4147, category: "kultur", cost: "Eintritt ca. 6€", access: "Parkplatz am Fuß des Hügels", description: "Templerordens-Festung, manuelinisches 'Fenster von Tomar', UNESCO seit 1983.", amenities: "Parkplatz, WC", source: "core" },
        { id: "s1404", name: "Castelo de Almourol", lat: 39.4939, lon: -8.3667, category: "kultur", cost: "Boot ca. 3€", access: "Nur per Boot erreichbar, Parkplatz am Ufer", description: "Burg auf einer Felseninsel mitten im Tejo, erbaut 1171.", amenities: "Parkplatz, kleiner Kiosk", source: "core" },
        { id: "s1405", name: "Mesa de Lemos (Viseu)", lat: 40.6200, lon: -7.8800, category: "genuss", cost: "Degustationsmenü ca. 130-170€", access: "Ca. 15 Min. von Viseu entfernt", description: "1 Michelin-Stern + Grüner Stern. Chef Diogo Rocha, kreative Küche mit eigenem Gemüsegarten, passt gut auf dem Weg Richtung Serra da Estrela.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1406", name: "Camping Municipal da Guarda", lat: 40.5364, lon: -7.2683, category: "camping", cost: "ca. 8-15€/Nacht", access: "Nahe Guarda-Zentrum, guter Ausgangspunkt für die Serra da Estrela", description: "Pincamp-Empfehlung: einfacher, günstiger Stellplatz als Basis für die Serra da Estrela und die historischen Dörfer.", amenities: "Sanitär, Strom - vor Ort bestätigen", source: "enriched" },
        { id: "s1407", name: "Ó Balcão (Santarém)", lat: 39.2362, lon: -8.6858, category: "genuss", cost: "Menü ca. 60-90€", access: "Santarém, auf dem Weg zwischen Lissabon und Tomar/Fátima", description: "1 Michelin-Stern + Grüner Stern. Chef Rodrigo Castelo, auf Fisch spezialisiert, gutes Preis-Leistungs-Verhältnis.", amenities: "Reservierung empfohlen", source: "enriched" },
        { id: "s1408", name: "Trancoso (Aldeia Histórica)", lat: 40.7833, lon: -7.35, category: "kultur", cost: "kostenlos", access: "Zentral in der Beira, gute Zufahrt", description: "Eines der 12 offiziellen Aldeias Históricas de Portugal. Ummauerte Stadt mit jüdischem Viertel und Burg König Dinis'.", amenities: "Parkplatz, Restaurants", source: "enriched" },
        { id: "s1409", name: "Castelo Rodrigo (Aldeia Histórica)", lat: 40.8667, lon: -6.95, category: "kultur", cost: "kostenlos", access: "Nahe Figueira de Castelo Rodrigo, kurvige Zufahrt", description: "Eines der 12 offiziellen Aldeias Históricas. Fast menschenleere Burgstadt mit Mandelbaumblüte im Frühling.", amenities: "kleiner Parkplatz", source: "enriched" },
        { id: "s1410", name: "Linhares da Beira (Aldeia Histórica)", lat: 40.6167, lon: -7.4833, category: "kultur", cost: "kostenlos", access: "Fuß der Serra da Estrela", description: "Eines der 12 offiziellen Aldeias Históricas. Beeindruckende Burg mit Blick auf die Serra da Estrela.", amenities: "kleiner Parkplatz", source: "enriched" },
        { id: "s1411", name: "Sortelha (Aldeia Histórica)", lat: 40.3167, lon: -7.15, category: "kultur", cost: "kostenlos", access: "Nahe Sabugal, kurvige Bergstraße", description: "Eines der 12 offiziellen Aldeias Históricas - gilt als mittelalterlichstes der Dörfer, fast menschenleer, komplett ummauert.", amenities: "kleiner Parkplatz", source: "enriched" },
        { id: "s1412", name: "Belmonte (Aldeia Histórica)", lat: 40.3583, lon: -7.35, category: "kultur", cost: "Jüdisches Museum ca. 2€", access: "Nahe Covilhã, gute Zufahrt", description: "Eines der 12 offiziellen Aldeias Históricas. Bedeutende jüdische Geschichte (Krypto-Juden), jüdisches Museum, Geburtsort von Pedro Álvares Cabral.", amenities: "Parkplatz, Restaurants", source: "enriched" },
        { id: "s1413", name: "Piódão (Aldeia Histórica)", lat: 40.1667, lon: -7.7333, category: "kultur", cost: "kostenlos", access: "Abgelegen in der Serra do Açor, sehr kurvige Zufahrt", description: "Eines der 12 offiziellen Aldeias Históricas. Schieferdorf mit blauen Fenstern und Türen, malerischste Lage der 12 Dörfer.", amenities: "kleiner Parkplatz", source: "enriched" },
        { id: "s1414", name: "Idanha-a-Velha (Aldeia Histórica)", lat: 39.9667, lon: -7.15, category: "kultur", cost: "kostenlos", access: "Nahe Idanha-a-Nova, gute Zufahrt", description: "Eines der 12 offiziellen Aldeias Históricas. Winziges Dorf mit römisch-westgotischen Ruinen und freilaufenden Störchen.", amenities: "kleiner Parkplatz", source: "enriched" },
        { id: "s1415", name: "Marialva (Aldeia Histórica)", lat: 40.7167, lon: -7.2, category: "kultur", cost: "kostenlos", access: "Nahe Meda, kurvige Zufahrt", description: "Eines der 12 offiziellen Aldeias Históricas. Burg auf Felsmassiv, sehr mittelalterliches Flair.", amenities: "kleiner Parkplatz", source: "enriched" }
      ]
    }
  ]
};

// Für Umgebungen ohne ES-Module (einfacher <script>-Tag)
if (typeof module !== "undefined") {
  module.exports = TRIP_DATA;
}
