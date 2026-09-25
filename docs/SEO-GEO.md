# Auffindbarkeit für Candy Corner

Stand: 25.09.2026 · Theme 2.3.0

## Was umgesetzt ist

Der native WordPress-Shop liefert Inhalte und Metadaten bereits als HTML aus. Kunden und Suchmaschinen sehen dieselben Angaben. Startseite, Sortiment, Produktseiten und Kategorien sind regulär verlinkt; Lieferung in Essen, PLZ-Prüfung, Abholung, Mindestbestellwert und Lieferkosten stehen als lesbarer Text auf der Seite.

- Titel, Seitenbeschreibungen, kanonische URLs und Open-Graph-Texte. Die kanonische Domain stammt aus der tatsächlichen WordPress-Adresse, aktuell `https://vape.miami-enterprise.com`, nicht aus der zukünftigen Wunschdomain oder dem internen Port.
- WordPress-XML-Sitemap unter `/wp-sitemap.xml`, verlinkt in der automatisch erzeugten `/robots.txt`. Warenkorb, Kasse, Konto, Widerrufsformular, passwortgeschützte Seiten und unveränderte Demoprodukte werden aus dieser Sitemap ausgeschlossen; keine Autoren-Sitemap.
- `noindex` für Warenkorb, Kasse, Konto, interne Suche, Filter-/Sortieransichten, Fehlerseiten, Autoren-/Datumsarchive, Anhangseiten, passwortgeschützte Seiten, Widerrufsformular und Demoprodukte. Zusätzlich sendet der Shop dafür einen `X-Robots-Tag`-HTTP-Header. Das schützt vor Indexierung, ersetzt aber keine Zugriffsrechte für private Daten.
- JSON-LD mit `WebSite` und `Organization`. Erst nach bestätigter vollständiger Geschäftsadresse wird daraus `Store` (Untertyp von `LocalBusiness`). Keine erfundenen Koordinaten, Bewertungen, Öffnungszeiten oder Adresse. Eingetragene Kontaktdaten stehen auch sichtbar auf der Startseite.
- WooCommerce liefert weiterhin seine eigenen Produkt-/Angebotsdaten und Breadcrumbs. Keine zweite, widersprüchliche Product-Auszeichnung durch das Theme. Unveränderte Beispielprodukte erhalten keine Product-Daten.
- Responsive WebP-Bilder mit echten `img`-Elementen, Alternativtexten, Bildabmessungen und `srcset`. Das Kampagnenbild lädt mit hoher Priorität; Bilder weiter unten laden verzögert.
- Google- und Bing-Verifizierungscodes können im Admin eingetragen werden. Ein Konto wird dadurch nicht automatisch erstellt oder verifiziert.

Die separate Sites-Designvorschau bleibt `noindex`, damit die Beispielprodukte und die Vorschauadresse nicht mit dem echten Shop konkurrieren.

## Einrichtung im WordPress-Admin

1. **Design → Auffindbarkeit:** öffentliche Telefonnummer, Geschäfts-E-Mail, tatsächliche Öffnungs-/Lieferzeiten und echte Profil-URLs eintragen. Diese Angaben erscheinen auf der Startseite. Die Zeiten sind nur eine Kundeninformation; sie aktivieren keine automatische Bestellzeit-Steuerung.
2. **WooCommerce → Einstellungen → Allgemein:** vollständige Geschäftsadresse eintragen. Anschließend unter „Auffindbarkeit“ ausdrücklich bestätigen. Für die lokalen Daten prüft das Theme eine Essener PLZ, Stadt Essen und Deutschland. Ohne bestätigte Adresse bleiben neutrale Unternehmensdaten bestehen.
3. **Design → Candy Corner Einrichtung:** Abholadresse auf den gleichen tatsächlichen Stand bringen, Lieferbereich und Konditionen prüfen. Geschäftsadresse und Abholadresse sind getrennte Einstellungen; das Update überschreibt keine bestehende Adresse.
4. **Produkte:** echte Bilder, verständliche Produktnamen und Beschreibungen, Menge, Preis und Lebensmittel-Pflichtangaben hinterlegen. Die vier mitgelieferten Produktbilder sind KI-Beispiele. Solange ein importierter Demoartikel keinen eigenen Bildanhang erhält, bleibt er `noindex` und ohne Product-Auszeichnung. Vor Veröffentlichung auch alle anderen Beispieldaten ersetzen.
5. **Einstellungen → Lesen:** erst nach fertigen Betreiberseiten und echtem Sortiment die Option „Suchmaschinen davon abhalten …“ deaktivieren. Das Update verändert diese bewusste Einstellung nicht.
6. Domain in [Google Search Console](https://search.google.com/search-console/) und [Bing Webmaster Tools](https://www.bing.com/webmasters/) hinzufügen. DNS-Verifizierung ist für eine ganze Domain sinnvoll; alternativ den reinen HTML-Verifizierungscode unter „Auffindbarkeit“ eintragen. Sitemap anmelden und wichtige URLs prüfen.
7. Ein echtes [Google-Unternehmensprofil](https://www.google.com/business/) für den Laden pflegen: Name, Anschrift, Telefonnummer, Öffnungszeiten und Website müssen mit der Website übereinstimmen. Keine Bewertungen erfinden. Die Konten und der Adresseintrag benötigen den Betreiber; sie wurden nicht für ihn angelegt.

Falls Yoast, Rank Math, AIOSEO oder SEOPress installiert wird, überlässt das Theme diesem Plugin seine eigenen Titel, Beschreibungen, Canonicals und Unternehmensdaten. Die sichtbaren Kontaktdaten und der `noindex`-HTTP-Header bleiben erhalten. **Dann die Unternehmensdaten, Sitemap-Ausschlüsse, Autorenseiten und Verifizierung im verwendeten Plugin ebenfalls passend konfigurieren.** Keine vollständige Integration in alle Plugin-Versionen zugesichert; der getestete Normalbetrieb benötigt kein zusätzliches SEO-Plugin.

## GEO und KI-Suche

GEO (Generative Engine Optimization) baut hier auf verständlichen, überprüfbaren lokalen Angaben und sauber zugänglichem HTML auf. Google nennt dieselben technischen SEO-Grundlagen für AI Overviews/AI Mode; spezielle KI-Dateien oder ein besonderes Schema sind dafür nicht erforderlich. Ein `llms.txt` ist deshalb keine Voraussetzung und wird nicht als Ranking-Maßnahme vorgetäuscht. [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).

Die WordPress-Standardregeln erlauben das öffentliche Frontend auch Such-Crawlern wie `OAI-SearchBot`, solange Suchmaschinen-Sichtbarkeit aktiviert ist. Der Host darf diese Zugriffe nicht durch Login, CAPTCHA oder pauschale Bot-Sperren blockieren. **ChatGPT-Suche (`OAI-SearchBot`) und Modelltraining (`GPTBot`) sind getrennte Crawler.** Für Suche muss GPTBot nicht eigens freigegeben werden. Bestehende, bewusst gesetzte Server-/robots-Regeln werden vom Theme nicht überschrieben. Bei einer WAF die offiziellen Bot-Informationen und IP-Bereiche verwenden. [OpenAI: Crawler-Dokumentation](https://developers.openai.com/api/docs/bots).

Es gibt keine Garantie auf Indexierung, bestimmte Platzierungen, KI-Nennungen oder mehr Verkäufe. Die Wirkung wird später über Search Console, Bing und echte Anfragen beurteilt. Optional kann nach Domain-Verifizierung ein offizielles IndexNow-Plugin neue/aktualisierte URLs an unterstützende Suchmaschinen melden; IndexNow ersetzt weder Sitemap noch Indexprüfung. [Bing: IndexNow](https://www.bing.com/indexnow/getstarted).

## Wechsel zur endgültigen Domain

Solange der Shop unter `vape.miami-enterprise.com` betrieben wird, zeigen seine kanonischen URLs dorthin. Beim Umzug auf `www.candycorner-essen.de`:

- DNS und HTTPS einrichten; `SITE_URL`/`SHOP_DOMAIN` ändern und das dokumentierte Server-Update ausführen.
- Alte URLs pfadweise dauerhaft per 301 zur neuen Domain weiterleiten. Keine zwei parallel indexierbaren Kopien betreiben.
- Fest gespeicherte interne URLs nach Backup prüfen/ersetzen; PayPal-Rücksprung-/Webhook-Konfiguration kontrollieren.
- Neue Domain in den Webmaster-Tools verifizieren, Sitemap neu anmelden und den Umzug verfolgen. Lokales Unternehmensprofil und externe Links aktualisieren.

[Google: kanonische URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [lokale Unternehmensdaten](https://developers.google.com/search/docs/appearance/structured-data/local-business), [Bilder in der Suche](https://developers.google.com/search/docs/appearance/google-images), [Mobile-first-Indexierung](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing).

## Abnahme nach dem Server-Update

`/`, `/shop/` bzw. den tatsächlichen Shop-Slug, `/robots.txt` und `/wp-sitemap.xml` aufrufen. Die Sitemap muss zur aktuellen HTTPS-Domain gehören und ohne Anmeldung abrufbar sein. Quelltext auf eine kanonische URL ohne `:8080` prüfen. Shop-interne Seiten müssen `noindex` behalten. Homepage und ein echtes Produkt in Search Console / Rich Results Test prüfen. Bei aktivem SEO-Plugin dessen Sitemap-URL verwenden.

Mobile Prüfung bei 320 und 390 Pixel: PLZ-Feld und Prüfbutton früh erreichbar, kein horizontaler Seitenüberlauf, Menü bedienbar, lesbare Eingaben und Bildverhältnisse. Lighthouse/PageSpeed können auf dem Zielserver messen; es wurde kein garantierter Score oder gemessener Core-Web-Vitals-Erfolg behauptet.
