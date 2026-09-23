# Candy Corner — Candy-Shop für Essen

Neugestaltung auf Basis des bereitgestellten Logos: Schwarz, Neonpink und Cyan. Oben stehen Lieferung/Abholung, PLZ-Prüfung und Konditionen; darunter Candy-Kampagne, Kategorien, Suche, Produktkarten und Warenkorb.

## Zwei passende Ausgaben

- **`app/`**: interaktive Sites-/React-Designvorschau. Suche, Filter, Sortierung, Merkliste für die Sitzung, Produktdetails und lokaler Warenkorb. Beispielprodukte/-preise, keine Bestell- oder Zahlungsabwicklung und keine Live-WordPress-Verbindung.
- **`wordpress/forme/`**: natives WordPress-Theme **Candy Corner 2.0** mit WooCommerce. Echte Produktverwaltung, Warenkorb, Konto, Kasse, Preise/Bestände und Zahlungsanbieter laufen über WooCommerce. Der Ordnername `forme` bleibt für kompatible Updates erhalten.

## Lieferung und Abholung

Vorgaben: **20 € Mindestbestellwert**, **5 € Lieferkosten**, vorläufiger Abholort **Essen-Zentrum**. Der Mindestbestellwert gilt für Lieferung und Abholung nach Rabatten, einschließlich Warensteuer, ohne Versand. Abholung hat keine Lieferkosten.

Die tatsächlichen Liefer-PLZ und die vollständige Abholadresse wurden noch nicht angegeben. Deshalb bestätigt die Vorschau keine Lieferbarkeit. Die echte Einrichtung erfolgt unter **Design → Candy Corner Einrichtung**. Dort lassen sich Liefergebiet, Adresse und Preise zentral pflegen und der Lieferservice aktivieren. Während der Aktivierung ersetzt er andere Versandarten, ohne deren Konfiguration zu löschen. Ohne PLZ-Liste keine Liefermethode; ohne vollständige Abholadresse keine Abholmethode.

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

Echte Produkte mit zutreffenden Bildern, Zutaten, Allergenen, Nährwerten, Mengen und erforderlichen Preisangaben einpflegen. Liefergebiet, Anschrift, Bestellzeiten, Kontakt- und Betreiberseiten ergänzen. Steuern, Zahlungsarten und Bestell-E-Mails konfigurieren und vollständige Testbestellungen durchführen. Der optionale Import legt vier einfache Beispielprodukte als Entwürfe mit Bestand 0 an und ist wiederholbar, ohne Duplikate zu erzeugen.

## Validierung

Siehe [docs/VALIDATION.md](docs/VALIDATION.md) für ausgeführte Prüfungen und Grenzen. Kein echter Zahlungsvorgang und kein produktiver Server wurden verändert.

## Referenz und Technik

Die gewünschte [Spizzenzeit-Referenz](https://spizzenzeit-essen.de/) dient als Orientierung für den Bestellablauf. Logo, Gestaltung, Texte und Candy-Motive sind eigenständig.

- [WooCommerce Shipping Method API](https://developer.woocommerce.com/docs/features/shipping/shipping-method-api/)
- [WooCommerce Store API / Cart](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/)
- [WordPress Playground](https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/)
