# Candy Corner — Candy-Shop für Essen

Neugestaltung auf Basis des bereitgestellten Logos: Schwarz, Neonpink und Cyan. Oben stehen Lieferung/Abholung, PLZ-Prüfung und Konditionen; darunter Candy-Kampagne, Kategorien, Suche, Produktkarten und Warenkorb.

## Zwei passende Ausgaben

- **`app/`**: interaktive Sites-/React-Designvorschau. Suche, Filter, Sortierung, Merkliste für die Sitzung, Produktdetails und lokaler Warenkorb. Beispielprodukte/-preise, keine Bestell- oder Zahlungsabwicklung und keine Live-WordPress-Verbindung.
- **`wordpress/forme/`**: natives WordPress-Theme **Candy Corner 2.3** mit WooCommerce. Echte Produktverwaltung, Warenkorb, Konto, Kasse, Preise/Bestände und Bar-/PayPal-Bestellungen laufen über WooCommerce. Der Ordnername `forme` bleibt für kompatible Updates erhalten.

## Lieferung und Abholung

Vorgaben: **20 € Mindestbestellwert**, **5 € Lieferkosten**, vorläufiger Abholort **Essen-Zentrum**. Der Mindestbestellwert gilt für Lieferung und Abholung nach Rabatten, einschließlich Warensteuer, ohne Versand. Abholung hat keine Lieferkosten.

Die **32 Essener Postleitzahlen** sind hinterlegt. Außerhalb der freigegebenen Essener PLZ ist keine Lieferbestellung möglich. Der Betreiber fährt persönlich aus; es gibt keinen Paketversand. Bezahlt wird bar bei Übergabe. Unter **Design → Candy Corner Einrichtung** lassen sich Liefergebiet (innerhalb Essens), Adresse und Preise zentral pflegen und der Service aktivieren. Ohne vollständige Adresse bleibt Abholung gesperrt. Eine fehlgeschlagene Lieferprüfung schaltet nicht automatisch auf Abholung um.

Domain: **www.candycorner-essen.de**. WordPress bietet Produkt-/Lagerpflege und Bestellverwaltung; neue Bestellungen können über die WooCommerce-App auf Handy/iPad gemeldet werden. Einrichtung: [Docker-Anleitung](docker/README.md). Multisite für getrennte Domains: [Netzwerk-Anleitung](docker/MULTISITE.md).

Wie angefragt ist die **Kleinunternehmerregelung (§ 19 UStG)** voreingestellt: keine Umsatzsteuerberechnung, entsprechender Preishinweis. Das setzt die tatsächliche Anwendung von § 19 UStG voraus; „Kleingewerbe“ allein bedeutet keine Umsatzsteuerbefreiung. Pro Artikel lässt sich ein optionaler **18+-Hinweis** aktivieren. Diese Selbstauskunft ist keine Altersverifikation; keine Beispielprodukte sind markiert.

PLZ-Prüfung und Checkout verwenden dieselben Regeln. Eine erfolgreiche Auswahl setzt die WooCommerce-Sitzung. Kasse und Store API prüfen das Liefergebiet und den Mindestbestellwert serverseitig. Die Lieferpauschale ist der Endpreis inklusive ggf. anfallender Steuer. Veränderte Regeln invalidieren zuvor zwischengespeicherte Versandraten.

Die Vorschau-Konfiguration liegt in `lib/shop-config.ts`; sie ist separat von einer späteren WordPress-Installation. Der native Shop nutzt die WordPress-Option `candy_corner_delivery` und echte WooCommerce-Produkte.

## Installation und Übergabe

- [Server-Anleitung mit Docker und optional HTTPS](docker/README.md)
- [WordPress-Theme als ZIP](public/downloads/forme-woocommerce-theme.zip)
- [Deutschsprachige Einrichtung](public/downloads/forme-einrichtung.html)

```sh
sh docker/create-env.sh
# .env: WP_ADMIN_EMAIL und SITE_URL, bei HTTPS zusätzlich SHOP_DOMAIN setzen.
docker compose up -d --build
docker compose logs -f setup
```

Die bestehende Compose-Struktur und die Volume-Namen bleiben erhalten. Der sichtbare Shopname für neue Installationen ist Candy Corner. Bei bestehenden Installationen Produkte, Menüs, eigenes Logo, Customizer-Texte und Seitentitel selbst umstellen; ein Code-Update verändert keine vorhandenen Inhalte oder Bestellungen.

## Entwicklung

Node.js >=22.13, `npm ci`, `npm run dev`, `npm run build`. Framework/Lockfile des bestehenden Projekts wurden beibehalten. Bilder und exakte Generierungsprompts: [docs/ASSETS.md](docs/ASSETS.md).

## Verkaufsstart

Echte Produkte mit zutreffenden Bildern, Zutaten, Allergenen, Nährwerten, Mengen und erforderlichen Preisangaben einpflegen. Liefergebiet, Anschrift, Bestellzeiten, Kontakt- und Betreiberseiten ergänzen. Kleinunternehmer-Einstellung prüfen, Bestell-E-Mails und App-Mitteilungen einrichten und vollständige Testbestellungen durchführen. Der optionale Import legt vier einfache Beispielprodukte als Entwürfe mit Bestand 0 an und ist wiederholbar, ohne Duplikate zu erzeugen.

## Validierung

Siehe [docs/VALIDATION.md](docs/VALIDATION.md) für ausgeführte Prüfungen und Grenzen. Kein echter Zahlungsvorgang und kein produktiver Server wurden verändert.

## Referenz und Technik

Die gewünschte [Spizzenzeit-Referenz](https://spizzenzeit-essen.de/) dient als Orientierung für den Bestellablauf. Logo, Gestaltung, Texte und Candy-Motive sind eigenständig.

- [WooCommerce Shipping Method API](https://developer.woocommerce.com/docs/features/shipping/shipping-method-api/)
- [WooCommerce Store API / Cart](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/)
- [WordPress Playground](https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/)

Die PLZ-Liste liegt gemeinsam in `wordpress/forme/data/essen-postcodes.json`. Quelle: [Stadt Essen, 3. Fortschrittsbericht 2023, PLZ-Tabelle](https://media.essen.de/media/wwwessende/aemter/gha/2025_dokumente/3._Fortschrittsbericht_2023.pdf). [§ 19 UStG](https://www.gesetze-im-internet.de/ustg_1980/__19.html).

## Update vom 25.09.2026

Mobile Logo-Einpassung und Warenkorb korrigiert, offizielle PayPal-Anbindung vorbereitet, rechtliche Entwürfe und elektronischer Widerruf ergänzt. Betreiberangaben bleiben auf Wunsch Platzhalter. PayPal-Geschäftskonto ist noch anzulegen/zu verbinden.

- **[Server-Update für vape.miami-enterprise.com](docker/UPDATE-2026-09.md)** — Backup, bestehende Datenvolumes, öffentliche URL ohne internen Port.
- **[PayPal: Gebühren und Einrichtung](docs/PAYPAL.md)** — kostenlose Erweiterung, kostenpflichtige Transaktionen.
- **[Rechtstexte und noch benötigte Angaben](docs/RECHTLICHES.md)** — Bearbeitung in WordPress unter Design → Rechtstexte & PayPal.

Der Produktionsshop liegt auf eurem eigenen Server. Die Sites-Adresse bleibt eine öffentliche Designvorschau ohne Bestell- oder Zahlungsabwicklung.

## WebP, Mobile First und Suchmaschinen

Theme 2.3.0 enthält responsive WebP-Bilder, ein gemeinsames Layout mit Handy als Ausgangspunkt und eine native SEO-Grundausstattung. Die größten WebP-Dateien benötigen zusammen 92,7 % weniger Bytes als die ursprünglichen PNGs. Die PLZ-Prüfung bleibt auf Mobilgeräten früh erreichbar; größere Touchflächen, ein mobiles Menü und passende Bildabmessungen sind hinterlegt.

**[SEO/GEO, KI-Suche und Einrichtung](docs/SEO-GEO.md)** erklärt Metadaten, Sitemap, Unternehmensdaten, Domainwechsel und die noch nötige Verifizierung. Kontakt/Öffnungszeiten unter **Design → Auffindbarkeit** pflegen. Echte Adresse und Produktdaten sind weiterhin zu ergänzen. Das Update aktiviert keine zuvor gesperrte Suchmaschinen-Indexierung. **[Bilddateien und Größen](docs/ASSETS.md)**.
