# Candy Corner — Prüfung am 23.09.2026

## Designvorschau

- TypeScript-Prüfung bestanden.
- React-/Accessibility-Lint für die Anwendungsdateien bestanden.
- Produktionsbuild des bestehenden Vinext-/Sites-Projekts bestanden.
- Reale lokale HTTP-Anfrage: Status 200.
- Warenkorbdaten normalisiert: ungültige Produkte/Mengen verworfen, doppelte Artikel zusammengefasst, höchstens 20 Stück je Artikel.
- Cent-genaue Summen, 20 € Mindestbestellwert und 5 € Lieferkosten geprüft.
- Ungültige PLZ und fehlendes Liefergebiet geben keine Lieferzusage.

## Native WordPress-/WooCommerce-Version

Ausgeführt in einer isolierten WordPress-Playground-Installation mit WordPress 7.1.1, WooCommerce 11.1.1 und PHP 8.3. Keine produktiven Daten verwendet.

25 Regelprüfungen bestanden, darunter:

- Theme aktiviert; vier Candy-Produkte als Entwurf mit Bestand 0 importiert. Wiederholter Import erzeugt keine Duplikate.
- Gültige, nicht belieferte und ungültige PLZ sowie fremdes Land geprüft.
- Warenkorb 19,60 € abgelehnt; 24,50 € akzeptiert. Versand zählt nicht zum Mindestbestellwert.
- Mindestbestellwert nach Rabatt sowie im WooCommerce-Store-API-Validierungshook geprüft.
- Lieferung 5 €, Abholung 0 €. Lieferkosten einschließlich Test-Umsatzsteuer bleiben 5 €.
- Kein Liefertarif außerhalb des Liefergebiets; kein Abholtarif ohne Adresse; keine Tarife bei komplett fehlender Konfiguration.
- Ungültige PLZ-Einstellungen werden zurückgewiesen. Änderungen der Regeln invalidieren bestehende Versandraten auch bei mehreren Änderungen innerhalb einer Sekunde.
- Startseite, Shop, Warenkorb, Kasse, Kundenkonto und ein Produktdetail: HTTP 200 ohne PHP-Fatalfehler.
- Echte HTTP-Anfragen an die PLZ-/Abhol-AJAX-Funktion: berechtigte PLZ, nicht belieferte PLZ, Abholung, WooCommerce-Sitzungscookie und Zurückweisung einer ungültigen Nonce geprüft.

Die Testadresse wurde ausschließlich in der isolierten Testdatenbank verwendet. Das Liefergebiet wurde in der folgenden Erweiterung auf die offizielle Essener PLZ-Liste gesetzt; eine echte Ladenadresse ist weiterhin nicht hinterlegt.

## Docker und Grenzen

- Basis-Compose und HTTPS-Override mit dem offiziellen Compose-CLI ohne Docker-Daemon validiert.
- Shellsyntax der bestehenden Einrichtungs-, Passwort- und Backup-Skripte geprüft.
- Keine Docker Engine verfügbar: kein Image-Build und kein Container-Ende-zu-Ende-Test durchgeführt.
- Kein Browser-Interaktionstest beauftragt oder durchgeführt; keine Aussage über visuelle Browser-QA.
- Keine echte Zahlung und keine produktive Bestellung ausgeführt. Versand, Steuern und Zahlungsanbieter vor dem Start auf dem Zielserver mit den tatsächlich eingesetzten Einstellungen testen.

## Erweiterung: lokaler Lieferservice, Barzahlung und 18+-Hinweis

Erneut geprüft am 23.09.2026:

- Alle 32 Essener PLZ im Frontend erlaubt; acht ungültige/fremde PLZ einschließlich Lücken innerhalb des Zahlenbereichs abgewiesen. PHP verwendet dieselbe JSON-Liste. Auch eine fremde, direkt in die Datenbank geschriebene PLZ umgeht die Begrenzung nicht.
- Kein automatischer Wechsel von abgewiesener Lieferung auf Abholung. Abholung setzt eine bewusste Auswahl und eine vollständige Abholadresse voraus. Änderungen der Auswahl invalidieren den Versandcache.
- Classic-Checkout- und Store-API-Validierung: Fremd-PLZ, andere Versandmethoden, andere Zahlungsarten und fehlende Telefonnummer abgewiesen.
- Barzahlung als einzige verfügbare Zahlungsart. Testbestellung erhält Status „In Bearbeitung“, noch kein Bezahldatum; Lagerbestand reduziert.
- Kleinunternehmer-Modus deaktiviert Steuerberechnung. Bestellmetadaten halten die verwendete Regel für den späteren E-Mail-Hinweis fest.
- 18+-Produktmarkierung: direkte Warenkorb-Anfrage ohne Sitzungsbestätigung abgewiesen, nach Bestätigung akzeptiert. Keine echten Produkte mit Altersbeschränkung angelegt.
- Echter interner Request an `/wc/store/v1/checkout`: Barbestellung angelegt, 24,50 € Warenwert + 5 € Lieferung = 29,50 €, 0 € Steuer.
- Die isolierte Playground-Umgebung nutzt SQLite. WooCommerces MySQL-Sperren zur Bestandsreservierung werden dort nicht unterstützt; für diesen einzelnen Store-API-Integrationstest war die Bestandsverwaltung des Testprodukts deaktiviert. Die vorherige Bestandsreduzierung einer Barbestellung wurde separat geprüft. Bestandsreservierung unter gleichzeitigen Bestellungen muss auf MariaDB im Zielserver getestet werden.
- TypeScript, Anwendungs-Lint und Produktionsbuild erfolgreich. Basis-/HTTPS-Compose sowie die Option `CANDY_MULTISITE=1` syntaktisch validiert.

Kein Docker-Daemon verfügbar: weiterhin kein Image-Build, Container-Test oder laufendes Multisite-Netzwerk. Keine realen Bestell-E-Mails gesendet (`pre_wp_mail` im Integrationstest blockiert). Geräte-Push, DNS/HTTPS der Kundendomain und der endgültige Warenbestand werden erst auf dem Zielserver eingerichtet und getestet. Kein Browser-Interaktionstest durchgeführt.

## Update 2.2 — 25.09.2026

- WordPress 7.1.1 / WooCommerce 11.1.1 / PHP 8.3 und das echte offizielle PayPal-Plugin 4.1.3 in isoliertem Playground: **74 Regel-/Integrationstests bestanden**, zusätzlich sechs Shopseiten und PLZ-AJAX über HTTP.
- PayPal ohne Kontoverbindung erscheint nicht als verfügbare Zahlungsart. Der Theme-Guard akzeptiert die offizielle PayPal-Gateway-ID, weist fremde Liefer-PLZ weiterhin zurück und schränkt Express-/Pay-Later-Funktionen ein. Keine erfundenen Zugangsdaten und kein realer Zahlungsvorgang.
- Fünf Rechtstext-Entwürfe, wiederholbarer Import, Veröffentlichungssperre bei Platzhaltern, Zuordnung von Datenschutz/AGB und unveränderter Rechtstextstand einer Bestellung geprüft.
- Widerruf: Eingabevalidierung, private Speicherung, identische Referenz bei erneutem Senden, Erhalt bei Mailfehler und Wiederholungsversuch geprüft. Mailtransport im Test abgefangen; keine externen E-Mails gesendet.
- Vollständiger anonymer Widerruf über echte HTTP-Anfragen: Formular → Prüfschritt → Bestätigung mit Inhalt und Zeitstempel; Wiederholung liefert dieselbe Referenz, ungültige Nonce wird abgewiesen. Browser-Prüfschritt ebenfalls durchlaufen.
- Separate PHP-Prüfung der URL-Synchronisierung: öffentliche HTTPS-Adresse ohne Port angenommen und in der Datenbank gespeichert; HTTP für öffentliche Domain, Port 8080 und Benutzerinformationen in der URL zurückgewiesen. Lokales http://localhost:8080 bleibt für Entwicklung erlaubt.
- Live-Seite nur gelesen: `/wp-admin` leitete auf HTTP um. Keine `:8080`-Adresse in der abgerufenen Startseite; Ursache einer konkreten 8080-Weiterleitung deshalb nicht vollständig reproduziert. Konfiguration/Update synchronisieren die öffentliche URL und dokumentieren die Proxy-Korrektur.
- Visuell im echten nativen WordPress-Theme bei 390 und 1280 Pixel Breite geprüft: mobile Logo-Höhe inklusive Drehung etwa 200 px statt zuvor 1046 px; Bildseitenverhältnis 3:2, kein horizontaler Seitenüberlauf, Warenkorb-Text transparent und nur der Zähler pink.
- TypeScript-/Anwendungs-Lint, Produktionsbuild, Shellsyntax und Basis-/HTTPS-Compose bestanden. Der offizielle PayPal-Download entspricht dem im Dockerfile hinterlegten SHA-256.

Weiterhin kein Docker-Daemon vor Ort: kein Image-Build oder MariaDB-Container-Abnahmetest. Sandbox-/Live-PayPal, Webhook-Zustellung, SMTP/Push und das Aufspielen auf den Produktionsserver bleiben beim Betreiber nach Konto-/Servereinrichtung zu prüfen. Die bestehende SQLite-Einschränkung des Bestandsreservierungstests gilt unverändert.
