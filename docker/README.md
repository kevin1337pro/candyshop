# Candy Corner auf einem Server mit Docker starten

Dieses Setup startet den **nativen WordPress-/WooCommerce-Shop** mit dem Candy-Corner-Theme. Die React-/Sites-Designvorschau wird dafür nicht benötigt. Produkte, Liefergebiet, Bestände und Bestellungen lassen sich anschließend in WordPress verwalten.

Enthalten sind WordPress mit Apache/PHP, WooCommerce, MariaDB, eine einmalige Einrichtung und ein optionaler Caddy-Reverse-Proxy für HTTPS. Der WordPress-Admin wird aus der lokalen `.env` angelegt. Die Einrichtung lässt bestehende Benutzer und Shop-Einstellungen bei späteren Starts unverändert.

## Voraussetzungen

- Linux-Server mit Docker Engine und aktuellem Docker Compose Plugin (`docker compose version`). ARM64 und AMD64 werden von den verwendeten Images unterstützt.
- Für den HTTPS-Betrieb: eine Domain mit A-/gegebenenfalls AAAA-Record auf diesen Server; Ports 80 und 443 frei und erreichbar. Ein AAAA-Record darf nur gesetzt sein, wenn IPv6 tatsächlich zum Server führt.
- Für den ersten Build Internetzugang zu Docker Hub, WordPress.org und den WordPress-Übersetzungsservern.
- Als praktische Ausgangsgröße: 2 GB RAM und ausreichend Speicher für Bilder, Datenbank und Backups.

## 1. Dateien und Zugangsdaten vorbereiten

```sh
git clone https://github.com/kevin1337pro/candyshop.git
cd candyshop
sh docker/create-env.sh
nano .env
```

Alternativ das [Repository als ZIP](https://github.com/kevin1337pro/candyshop/archive/refs/heads/main.zip) herunterladen und entpacken. Den **gesamten Ordner** auf den Server übertragen; das Dockerfile benötigt `wordpress/forme/` und `docker/`.

`create-env.sh` erzeugt drei unterschiedliche Zufallspasswörter und eine `.env` mit Dateirechten 600. Es überschreibt keine vorhandene `.env`. Mindestens die tatsächliche Admin-E-Mail eintragen:

```dotenv
WP_ADMIN_EMAIL=deine-adresse@example.de
```

Der Benutzer heißt standardmäßig `forme-admin`. Das initiale Passwort steht in `WP_ADMIN_PASSWORD` in der `.env`. Eine spätere Änderung dieser Variablen setzt **kein bestehendes WordPress-Passwort zurück**; Änderungen erfolgen im WordPress-Konto.

Ohne `openssl`: `.env.example` als `.env` kopieren, Dateirechte auf 600 setzen und die drei leeren Passwortfelder mit unterschiedlichen sicheren Passwörtern füllen. Passwörter aus `openssl rand -hex 24` benötigen keine besondere Maskierung. Eigene Werte mit `$` müssen in der Compose-`.env` in einfache Anführungszeichen gesetzt werden.

## 2a. Öffentlicher Server mit eigener Domain und HTTPS

Zusätzlich diese Werte in der `.env` setzen (für Candy Corner):

```dotenv
COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml
SHOP_DOMAIN=www.candycorner-essen.de
SITE_URL=https://www.candycorner-essen.de
```

`SHOP_DOMAIN` enthält nur den Hostnamen, ohne `https://` oder Pfad. Die HTTPS-Konfiguration verwendet daraus automatisch die passende WordPress-Adresse. `COMPOSE_FILE` sorgt dafür, dass auch spätere Compose-Befehle beide Dateien berücksichtigen.

```sh
docker compose config --quiet
docker compose up -d --build
docker compose logs -f setup
```

Wenn `Candy Corner ist eingerichtet` erscheint, mit `Ctrl+C` die Logansicht verlassen. `setup` ist ein einmaliger Prozess: **`Exited (0)` ist der erfolgreiche Zustand**. Caddy startet nach erfolgreicher Einrichtung und fordert das Zertifikat automatisch an.

- Shop: `https://www.candycorner-essen.de`
- Verwaltung: `https://www.candycorner-essen.de/wp-admin/`

```sh
docker compose ps -a
docker compose logs --tail=100 caddy
```

Auf demselben Server darf kein anderer Dienst bereits Ports 80/443 belegen. Falls dort schon ein Reverse-Proxy läuft, Variante 2b verwenden.

## 2b. Bestehender Reverse-Proxy oder lokaler Test

Für einen lokalen Test die Vorgaben beibehalten:

```dotenv
COMPOSE_FILE=docker-compose.yml
SITE_URL=http://localhost:8080
HTTP_BIND=127.0.0.1
HTTP_PORT=8080
```

```sh
docker compose config --quiet
docker compose up -d --build
docker compose logs -f setup
```

Aufrufen: `http://localhost:8080`, Verwaltung: `http://localhost:8080/wp-admin/`.

Auf einem entfernten Server ist dieser Port standardmäßig nur lokal erreichbar. Für einen Test vom eigenen Rechner einen SSH-Tunnel öffnen:

```sh
ssh -L 8080:127.0.0.1:8080 benutzer@server
```

Läuft bereits Nginx, Traefik oder ein anderer Reverse-Proxy, `SITE_URL` auf die endgültige HTTPS-Adresse setzen. Der Proxy auf dem Host leitet auf `http://127.0.0.1:8080` weiter und muss den ursprünglichen `Host` sowie `X-Forwarded-Proto: https` übergeben. Ein Proxy in einem anderen Container benötigt stattdessen ein gemeinsames Docker-Netzwerk; dessen `127.0.0.1` ist nicht der Host.

## 3. Sortiment und Shop konfigurieren

Nach dem ersten Start sind WooCommerce und Candy Corner aktiv, die WooCommerce-Seiten angelegt und EUR/Deutschland sowie Europe/Berlin voreingestellt.

- **Design → Customizer → Candy Corner Startseite:** Kampagnentexte und Bilder ändern.
- **Design → Candy Corner Einrichtung:** optional vier Candy-Produkte als Entwürfe anlegen. Die Produkte starten mit Bestand 0 und werden nicht automatisch verkauft.
- **Design → Candy Corner Einrichtung:** Die 32 voreingestellten Essener PLZ prüfen; bei Bedarf einzelne Gebiete entfernen. Vollständige Abholadresse ergänzen, sobald sie vorliegt. Vorgaben: Essen-Zentrum, 20 € Mindestbestellwert (auch Abholung), 5 € Lieferkosten als Endpreis. Sobald echte Artikel und Betreiberangaben vorhanden sind, den Lieferservice aktivieren. Lieferung kann ohne Abholadresse starten; Abholung bleibt dann gesperrt. Das Theme akzeptiert ausschließlich die lokale Lieferung oder ausdrücklich gewählte Abholung; vorhandene Versandzonen werden nicht verändert. Die PLZ-Prüfung und die Kasse verwenden dieselben Regeln. Ohne Liefer-PLZ keine Lieferung, ohne Abholadresse keine Abholung.
- **Produkte:** echte Artikel, Bilder, Zutaten, Allergene, Nährwerte, Mengen, Preise und Lagerbestände eintragen.
- **WooCommerce:** Barzahlung ist eingerichtet und die einzige angebotene Zahlungsart. Umsatzsteuer ist entsprechend der angefragten Kleinunternehmerregelung deaktiviert (§ 19 UStG); die Berechtigung dafür prüfen, denn ein Kleingewerbe allein genügt nicht. Bestell-E-Mails konfigurieren. Für zuverlässigen E-Mail-Versand einen SMTP-/Mailanbieter anbinden; das Container-Setup enthält keinen Mailserver.
- Service-Menü und Betreibertexte ergänzen, danach eine vollständige Testbestellung mit Barzahlung durchführen. Beim Test keine echte Kundenadresse verwenden.

Die KI-Beispielbilder werden mitgeliefert. Sie müssen für reale Verkäufe zu den angebotenen Produkten passen. Produktdetails, Konto und Warenkorb nutzen die nativen WooCommerce-Seiten; die lokale Merkliste der React-Vorschau gehört nicht zum Theme.

## Bestellungen auf Handy und iPad

Unter **WooCommerce → Bestellungen** sieht der Betreiber Kundenadresse, Telefonnummer, Artikel und Bestellbetrag. Neue Barbestellungen stehen in **In Bearbeitung**; erst nach Auslieferung und Barzahlung **Abgeschlossen** wählen. Bestände werden über WooCommerce geführt, daher auch Verkäufe im Laden im Bestand berücksichtigen.

1. Offizielle WooCommerce-App installieren und mit `https://www.candycorner-essen.de` sowie dem eigenen WordPress-Benutzer verbinden. Für Mitarbeiter ein eigenes Konto mit Rolle **Shop-Manager** anlegen.
2. In der App **Mein Shop → Never miss a new order** bzw. **Menü → Einstellungen → Push-Mitteilungen aktivieren** wählen. Mitteilungen auf dem Gerät erlauben.
3. Mit WooCommerce ab 10.9.2 und App ab 25.0.1 lässt sich Push direkt über die integrierte Verbindung aktivieren; dafür sind normalerweise weder das vollständige Jetpack-Plugin noch ein WordPress.com-Konto erforderlich. Falls die Funktion auf dem Gerät noch nicht angeboten wird, den offiziellen Einrichtungsweg in der App verwenden.
4. Eine Testbestellung durchführen und Eingang auf **jedem** benötigten Gerät prüfen. Die Geräte sind durch diese Code-Lieferung noch nicht verbunden.
5. Zusätzlich **WooCommerce → Einstellungen → E-Mails → Neue Bestellung** aktivieren und Empfänger setzen. Ein SMTP-/Maildienst ist separat einzurichten; Docker selbst enthält keinen Mailserver.

[Offizielle Anleitung für Push-Mitteilungen](https://woocommerce.com/document/woo-mobile-notifications/), [Barzahlung in WooCommerce](https://woocommerce.com/document/cash-on-delivery/).

## 18+-Hinweis pro Artikel

Unter **Produkte → Artikel bearbeiten → Produktdaten → Allgemein** lässt sich **18+ Hinweis anzeigen** aktivieren. Beim Öffnen oder Hinzufügen erscheint eine kurze Bestätigung. Bei „Nein“ bleibt der Artikel ungeöffnet bzw. wird nicht hinzugefügt. Die Bestätigung gilt für die WooCommerce-Sitzung. Direkte Warenkorb-Anfragen ohne Bestätigung werden ebenfalls abgewiesen. Keiner der vier Beispielartikel ist markiert. Es handelt sich um eine Selbstauskunft, nicht um einen Altersnachweis; konkrete betroffene Produktarten sind noch nicht angegeben.

## Mehrere Domains

[Multisite-Anleitung](MULTISITE.md): Eine WordPress-Installation und MariaDB können mehrere getrennte Shops verwalten. Das Standardsetup bleibt ein einzelner Shop. Die Option `CANDY_MULTISITE=1` bereitet die Netzwerkeinrichtung vor und entfernt globale URL-Overrides; sie konvertiert keine Datenbank. Mehrere Domains für denselben Shop benötigen nur Weiterleitungen.

## Update eines bisherigen FORME-Shops

Der technische Theme-Ordner `wordpress/forme`, der Compose-Projektname `forme` und die Setup-Markierung bleiben erhalten, damit bestehende Volumes, Benutzer und Bestellungen weiterverwendet werden. Der sichtbare Markenname lautet jetzt Candy Corner. Dieses Update richtet einmalig Barzahlung, Deutschland und die Kleinunternehmer-Vorgabe pro Candy-Corner-Website ein. Der Lieferservice bleibt bis zur Freischaltung aus. Vorhandene Inhalte werden nicht ersetzt: bestehende Kleidungsartikel, Menüs, eigenes Logo und Customizer-Texte selbst prüfen und bei Bedarf umstellen. Unter **Einstellungen → Allgemein** den Seitentitel ändern. Bestehende Shopdaten werden weder gelöscht noch automatisch umgewidmet.

## Daten, Theme und Updates

| Inhalt | Speicherort |
| --- | --- |
| Produkte, Kunden, Bestellungen, Einstellungen | Docker-Volume `forme_db_data` |
| WordPress, Plugins und hochgeladene Medien | Docker-Volume `forme_wordpress_data` |
| Candy-Corner-Theme | `wordpress/forme/`, im Container schreibgeschützt eingebunden |
| HTTPS-Zertifikate bei Caddy | Docker-Volume `forme_caddy_data` |
| Zugangsdaten | lokale, nicht versionierte `.env` |

Die Volumennamen verwenden `COMPOSE_PROJECT_NAME` als Präfix; für bestehende Installationen diesen Namen beibehalten. Die Volumes überstehen einen normalen Neustart oder `docker compose down`. **`docker compose down -v` löscht die Datenvolumes.**

Theme-Code kommt aus Git. Anpassungen im Theme-Ordner werden beim nächsten `git pull` berücksichtigt; individuelle Erweiterungen gehören vorzugsweise in ein Child-Theme. Inhalte und Customizer-Einstellungen bleiben in der Datenbank. Das Web-Backend kann den schreibgeschützten Theme-Quellcode nicht überschreiben.

Nach einem Backup:

```sh
git pull --ff-only
docker compose build --pull
docker compose up -d
docker compose logs --tail=100 setup
```

**Ein Image-Neubau aktualisiert vorhandene WordPress-/WooCommerce-Dateien im Datenvolume nicht automatisch.** Das offizielle Image kopiert sie nur beim erstmaligen Anlegen. WordPress und Plugins anschließend gezielt über den WordPress-Admin oder WP-CLI aktualisieren, zuerst in einer Testumgebung:

```sh
docker compose run --rm wpcli core version
docker compose run --rm wpcli plugin list
# Gezielte Updates, wenn geprüft und freigegeben:
# docker compose run --rm wpcli core update
# docker compose run --rm wpcli core update-db
# docker compose run --rm wpcli plugin update woocommerce
```

Falls Sprachdateien beim ersten Start nicht verfügbar waren:

```sh
docker compose run --rm wpcli language core install de_DE --activate
docker compose run --rm wpcli language plugin install woocommerce de_DE
```

Bei einem Domainwechsel `SITE_URL` und gegebenenfalls `SHOP_DOMAIN` anpassen. Bereits gespeicherte absolute Inhalts-URLs mit einem gesicherten WordPress-Migrations-/Search-Replace-Verfahren aktualisieren.

## Backup und Wiederherstellung

`docker/backup.sh` hält WordPress während der Sicherung kurz an, erstellt einen SQL-Dump und sichert das WordPress-Volume. Es startet WordPress auch nach einem fehlgeschlagenen Backup wieder, sofern es vorher lief. Backups enthalten personenbezogene Shopdaten; geschützt außerhalb des Servers aufbewahren.

```sh
sh docker/backup.sh
```

Die Dateien landen unter `backups/<Zeitstempel>/`. Zusätzlich `.env`, Git-Stand/Theme und gegebenenfalls eigene Zertifikats-/Proxy-Konfiguration separat sichern. Keine `.env` oder Backups ins öffentliche Repository hochladen.

Wiederherstellung auf einer bereits vorbereiteten Installation mit derselben `.env` und passenden Versionen (der Import ersetzt Daten, deshalb bewusst ausführen):

```sh
docker compose stop wordpress
docker compose up -d db
# warten, bis db healthy ist: docker compose ps db

docker compose exec -T db sh -c 'exec mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' < backups/ZEITSTEMPEL/database.sql
docker compose run --rm --no-deps -T --user 0 --entrypoint tar wpcli -xzf - -C /var/www/html < backups/ZEITSTEMPEL/wordpress.tar.gz

docker compose up -d
```

Das Archiv enthält das schreibgeschützt eingebundene Candy-Corner-Theme nicht; dessen Git-Stand muss zur Sicherung passen. Die Wiederherstellung sollte regelmäßig in einer separaten Testinstallation geprüft werden.

## Dateien und Versionen

- `Dockerfile`: WordPress `7.1.1-php8.3-apache`, WP-CLI `2.12.0`, WooCommerce `11.1.1` mit geprüftem SHA-256 des Downloadarchivs.
- `docker-compose.yml`: MariaDB `11.4`, WordPress, einmaliges `setup`, optionales `wpcli`-Werkzeug.
- `docker-compose.https.yml`: Caddy `2.11.4-alpine` mit persistenten Zertifikaten.
- `.env.example`, `docker/create-env.sh`: Konfiguration und Passworterzeugung.
- `.dockerignore`: beschränkt den Build-Kontext auf Theme und benötigte Docker-Dateien.

Die WordPress-/WooCommerce-Versionen entsprechen der bereits getesteten Theme-Kombination. Neue Installationen verwenden die im Dockerfile festgelegten Versionen. Bei Versionsänderungen den WooCommerce-Downloadhash ebenfalls anhand des offiziellen Downloads aktualisieren.

## Validierung dieser Lieferung

Compose-Konfiguration und HTTPS-Override wurden ohne Docker-Daemon geprüft; die Shellskripte wurden syntaktisch und die Erstinitialisierung mit einem simulierten WP-CLI auf Erststart/Wiederholung getestet. In der Erstellungsumgebung war keine Docker Engine vorhanden, daher wurde **kein Image-Build und kein Container-Ende-zu-Ende-Test** ausgeführt. Das neue Theme wurde nativ in WordPress Playground mit WordPress 7.1.1 / WooCommerce 11.1.1 / PHP 8.3 geprüft: PLZ-Regeln, Mindestbestellwert nach Rabatten, Liefer-/Abholtarife, Sitzungsübergabe und sechs Shopseiten. Details: `docs/VALIDATION.md`.

Vor Übergang in den echten Verkauf auf dem Zielserver Build, Healthchecks, Admin-Login und Testbestellung prüfen.

## Technische Quellen

- [Offizielles WordPress-Image und Persistenz](https://hub.docker.com/_/wordpress)
- [WordPress Docker-Entrypoint](https://github.com/docker-library/wordpress/blob/master/docker-entrypoint.sh)
- [WP-CLI-Erstinstallation und Passwortübergabe](https://developer.wordpress.org/cli/commands/core/install/)
- [Compose-Startreihenfolge und Healthchecks](https://docs.docker.com/compose/how-tos/startup-order/)
- [MariaDB-Healthcheck](https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/using-healthcheck-sh)
- [Caddy Docker-Image](https://hub.docker.com/_/caddy)
