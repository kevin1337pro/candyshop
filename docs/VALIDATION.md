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

Test-PLZ und Testadresse wurden ausschließlich in der isolierten Testdatenbank verwendet. Sie sind nicht als echtes Liefergebiet oder Abholadresse hinterlegt.

## Docker und Grenzen

- Basis-Compose und HTTPS-Override mit dem offiziellen Compose-CLI ohne Docker-Daemon validiert.
- Shellsyntax der bestehenden Einrichtungs-, Passwort- und Backup-Skripte geprüft.
- Keine Docker Engine verfügbar: kein Image-Build und kein Container-Ende-zu-Ende-Test durchgeführt.
- Kein Browser-Interaktionstest beauftragt oder durchgeführt; keine Aussage über visuelle Browser-QA.
- Keine echte Zahlung und keine produktive Bestellung ausgeführt. Versand, Steuern und Zahlungsanbieter vor dem Start auf dem Zielserver mit den tatsächlich eingesetzten Einstellungen testen.
