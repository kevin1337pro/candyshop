# FORME — Kleidungsshop

Moderner Kleidungsshop mit eigenständigem Design, originalen KI-Modebildern und einem nativen WordPress-/WooCommerce-Theme.

**[WordPress-Theme herunterladen](public/downloads/forme-woocommerce-theme.zip)** · **[Einrichtungsanleitung](wordpress/forme/README.txt)** · **[Bildprompts](docs/ASSETS.md)**

Zwei zusammengehörige Ergebnisse:

- `app/`: private, interaktive Designvorschau mit Suche, Kategorien, Größenfilter, Sortierung, Produktdetails, Merkliste und lokalem Warenkorb. Keine Zahlungs- oder Bestellabwicklung, keine WordPress-Verbindung.
- `wordpress/forme/`: installierbares natives WordPress-Theme mit WooCommerce-Unterstützung. Produktverwaltung, Varianten, Preis/Bestand, Warenkorb, Kasse und Konto verwenden WooCommerce-Core. Konfiguration der Startseite über den Customizer. Optionaler, geschützter Import von vier Beispielprodukten als Entwurf mit Bestand 0.

Das ZIP liegt unter `public/downloads/forme-woocommerce-theme.zip`; die deutschsprachige Einrichtung unter `public/downloads/forme-einrichtung.html`. Originale Bildprompts und Dateipfade: `docs/ASSETS.md`.

## Serverbetrieb mit Docker

Für den nativen WordPress-/WooCommerce-Shop gibt es jetzt ein `Dockerfile`, `docker-compose.yml` und ein optionales HTTPS-Setup. Datenbank, Uploads und Shop-Einstellungen bleiben in Docker-Volumes erhalten. **[Vollständige Server-Anleitung für die Übergabe](docker/README.md)**.

```sh
sh docker/create-env.sh
# .env öffnen: WP_ADMIN_EMAIL sowie die gewünschte SITE_URL setzen.
docker compose up -d --build
docker compose logs -f setup
```

Das Standardsetup ist über `http://localhost:8080` erreichbar. Für eine öffentliche Domain mit HTTPS die Angaben in `docker/README.md` übernehmen.

## Lokale Entwicklung

Node.js >=22.13, `npm install`, `npm run dev`, `npm run build`. In dieser Arbeitsumgebung wurde der bereitgestellte Node-24-Runtime direkt verwendet. Die Vorschau läuft über Vinext und den Sites-Worker. Keine Runtime-Geheimnisse nötig.

## Prüfergebnis

- TypeScript und React-/Accessibility-Lint für die Anwendungsdateien.
- Produktionsbuild des Sites-Workers.
- Native Installation in WordPress Playground mit WordPress 7.1.1, WooCommerce 11.1.1 und PHP 8.3.
- Theme aktiviert; vier variable Entwürfe mit insgesamt 18 Größenvarianten importiert; wiederholter Import erzeugt keine Duplikate.
- In einer ausschließlich lokalen Testinstanz eine Variante aktiviert und zwei Stück in den WooCommerce-Warenkorb gelegt: Zwischensumme 79,80 EUR.
- Startseite, Shop, Produktdetail, Warenkorb und Kundenkonto lieferten HTTP 200 ohne PHP-Fatalfehler.
- Keine echte Zahlung durchgeführt. Kein Zugang zu einer vorhandenen WordPress-Installation vorhanden. Kein Browser-Interaktionstest beauftragt.

## Betrieb

Die Designvorschau ersetzt kein WordPress-Hosting. Theme auf einer WordPress-Installation aktivieren, WooCommerce konfigurieren, echte Produkte und Betreibertexte einsetzen und Zahlungs-/Versandanbieter testen. Die Merkliste der Vorschau ist kein Bestandteil des nativen Themes.

Die Struktur nutzt die vom Nutzer genannte Referenz nur für allgemeine Shop-Prinzipien (Suche, Kategorien, Produktreihen). Marke, Texte, Code und Bilder sind eigenständig für Kleidung erstellt.

Technische Quellen: https://developer.woocommerce.com/docs/theming/theme-development/classic-theme-developer-handbook/ und https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/

## Öffentlicher Quellcode

Dieser Export enthält keine persönliche Sites-Projektzuordnung. Für eine neue Sites-Veröffentlichung wird ein eigenes Projekt registriert. Die bestehende private Designvorschau ist kein öffentliches WordPress-Hosting.
