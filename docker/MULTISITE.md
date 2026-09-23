# Mehrere Domains mit WordPress Multisite

**Ja:** Ein dauerhaft laufender WordPress-/PHP-/Apache-Container und ein MariaDB-Container können mehrere WordPress-Websites und WooCommerce-Shops betreiben. Caddy kann zusätzlich HTTPS für die Domains übernehmen. `setup` läuft einmal; `wpcli` nur bei Bedarf.

Candy Corner ist standardmäßig als einzelner Shop eingerichtet. Multisite ist eine optionale Netzwerkeinrichtung, noch kein angelegtes Netzwerk. Die Startkonfiguration unterstützt dafür `CANDY_MULTISITE=1`: Sie erlaubt die Netzwerkeinrichtung und setzt keine globalen `WP_HOME`-/`WP_SITEURL`-Werte, die sonst jede Domain auf Candy Corner umleiten würden.

## Welche Variante passt?

- Mehrere **eigenständige Websites/Shops**: Multisite. Je Website eigene Produkte, Bestellungen, Bestände, Einstellungen und Uploads. Gemeinsame WordPress-Dateien, Plugins, Benutzerbasis und eine Datenbank mit separaten Tabellen je Site. Theme-/Plugin-Updates wirken auf das gesamte Netzwerk. Benutzer benötigen ihre Berechtigungen jeweils pro Site.
- Mehrere Domains für **denselben Shop**: zusätzliche Domains am Reverse-Proxy auf die Hauptdomain umleiten. Kein Multisite nötig; Bestände und Bestellungen bleiben identisch.
- Multisite ist keine Trennung wie unabhängige Container: Ressourcen, Ausfälle, Updates und Datenbankzugang werden geteilt. Ein gemeinsamer Warenkorb oder synchroner Lagerbestand zwischen verschiedenen Shops entsteht dadurch nicht automatisch.

## Neues Netzwerk vorbereiten

Für mehrere Shops vorzugsweise eine frische Installation verwenden. Eine vorhandene produktive Installation nur nach geprüftem Backup und Testmigration umstellen. `COMPOSE_PROJECT_NAME` bei bestehenden Volumes nicht ändern.

1. Den Shop zunächst mit der endgültigen Hauptdomain `www.candycorner-essen.de` nach `README.md` einrichten. Die Hauptdomain muss bereits auf den Server zeigen und per HTTPS erreichbar sein. Für ein separates neues Netzwerk einen eigenen Ordner und eigene Volumes verwenden.
2. In `.env` `CANDY_MULTISITE=1` setzen und `docker compose up -d` ausführen. Diese Variable allein wandelt die Datenbank nicht um. Die bisher gespeicherte Site-URL muss bereits zur Hauptdomain passen.
3. In WordPress die Plugins vorübergehend deaktivieren, dann **Werkzeuge → Netzwerk-Einrichtung** öffnen. Für neue, getrennte Domains die Variante **Subdomains** wählen. Die Netzwerkeinrichtung ausführen.
4. Die von **dieser Installation** angezeigten Konstanten in `wp-config.php` und die angezeigten Rewrite-Regeln in `.htaccess` im WordPress-Volume übernehmen. Dafür den Container/WordPress-CLI verwenden; keine feste Site-ID oder Netzwerk-ID aus fremden Beispielen übernehmen. Die Dateien liegen unter `/var/www/html/`. Die Docker-Zugangsdaten und den bestehenden `WORDPRESS_CONFIG_EXTRA`-Abschnitt erhalten. Für Domain-Mapping außerdem `define('COOKIE_DOMAIN', false);` ergänzen, falls domainübergreifende Login-Cookies sonst stören. Erneut anmelden.
5. In **Netzwerkverwaltung → Themes** Candy Corner freigeben. WooCommerce netzwerkweit aktivieren oder gezielt pro Shop. Pro Shop Theme aktivieren, WooCommerce-Seiten erzeugen und Shopwährung, Zahlung und Lieferregeln prüfen. Der automatische Docker-Erststart richtet nur die Hauptwebsite ein.
6. Weitere Websites unter **Netzwerkverwaltung → Websites → Neu hinzufügen** erstellen. Danach unter **Bearbeiten → Website-Adresse (URL)** deren tatsächliche Domain einschließlich HTTPS setzen. WordPress unterstützt dieses Domain-Mapping ohne zusätzliches Mapping-Plugin.
7. Für jede neue Domain A-/gegebenenfalls AAAA-DNS zum Server setzen. In `docker/Caddyfile` einen **expliziten** zusätzlichen Block ergänzen:

```caddy
zweiter-shop.example.de {
    encode zstd gzip
    reverse_proxy wordpress:80
}
```

`zweiter-shop.example.de` ist nur ein Platzhalter. Den bestehenden Block für `{$SHOP_DOMAIN}` beibehalten. Caddy mit `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` neu laden. Keine beliebigen Hostnamen automatisch für TLS freigeben.

8. Je Website Admin-Login, Bilder, Produktlinks, Warenkorb, PLZ-Sperre, Checkout, E-Mails und App-Verbindung testen. Backups sichern immer die gesamte gemeinsame Datenbank und das WordPress-Volume.

Das Candy-Corner-Theme erzwingt den lokalen Essen-/Barzahlungsablauf. Für einen anderen Geschäftsablauf auf einer weiteren Domain ein passendes anderes Theme/Plugin verwenden. Dies ist kein allgemeines Theme für bundesweiten Versand.

## Eine zweite Domain für denselben Candy-Corner-Shop

Soll auch `candycorner-essen.de` ohne `www` funktionieren, beide DNS-Einträge auf den Server richten und diesen Zusatz in `docker/Caddyfile` eintragen:

```caddy
candycorner-essen.de {
    redir https://www.candycorner-essen.de{uri} permanent
}
```

Auch dabei übernimmt Caddy das Zertifikat. Der Zusatz ist bewusst nicht automatisch aktiv, solange der DNS-Eintrag der zweiten Domain nicht bestätigt ist.

## Quellen

- [WordPress: Netzwerk erstellen](https://developer.wordpress.org/advanced-administration/multisite/create-network/)
- [WordPress: Domain Mapping](https://developer.wordpress.org/advanced-administration/multisite/domain-mapping/)

Die Compose-Option wurde syntaktisch geprüft; ein vollständiges Multisite-Netzwerk wurde in dieser Lieferung nicht auf einem Server eingerichtet oder getestet.
