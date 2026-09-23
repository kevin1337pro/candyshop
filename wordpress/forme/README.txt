Candy Corner 2.1 — WordPress / WooCommerce

Installation: forme-woocommerce-theme.zip unter Design > Themes > Theme hochladen. WooCommerce installieren/aktivieren. Technischer Theme-Ordner und Textdomain bleiben "forme" für kompatible Updates.

Design > Candy Corner Einrichtung: Liefer-PLZ, Abholadresse, Mindestbestellwert und Lieferkosten. Vorgaben 20 EUR und 5 EUR, vorläufiger Standort Essen-Zentrum. Lieferservice erst nach kompletter Einrichtung aktivieren. Er ersetzt andere Versandarten, ohne deren Konfiguration zu löschen. Alle 32 Essener PLZ sind voreingestellt; die genaue Abholadresse folgt. Außerhalb der freigegebenen Essener PLZ ist keine Lieferbestellung möglich. Ohne vollständige Konfiguration werden keine entsprechenden Versandraten angeboten. Mindestbestellwert gilt inklusive Warensteuer nach Rabatten, ohne Versand, für Lieferung und Abholung. Lieferkosten sind Endpreis inklusive ggf. anfallender Steuer.

Design > Customizer > Candy Corner Startseite: Texte, Kampagnenbild. Design > Menüs: Hauptnavigation und Service/Rechtliches. Produkte: echte Bilder, Preise, Bestände und alle Produktinformationen pflegen. Optionale Beispielprodukte werden nur als Entwurf mit Bestand 0 angelegt; vorhandene SKUs werden übersprungen. Keine bestehenden Inhalte werden entfernt.

WooCommerce bleibt für Warenkorb, Kasse, Konto und Zahlungen zuständig. Die Startseiten-Auswahl wird bei erfolgreicher Prüfung an die WooCommerce-Sitzung übergeben. Die Kasse prüft das Liefergebiet erneut. Die React-/Sites-Vorschau ist separat und nimmt keine echten Bestellungen entgegen.

Für Docker siehe docker/README.md im Repository. Alle Theme-Dateien und Assets sind enthalten. Echte Produkte, Anschrift, Bestellzeiten, Betreiberinformationen, Kleinunternehmer-Einstellung und Bestellmitteilungen vor Verkaufsstart vervollständigen und Testbestellungen durchführen.

Barzahlung bei Übergabe ist als einzige Zahlungsart eingerichtet. Es gibt keinen Paketversand; der Betreiber liefert persönlich in Essen. Kleinunternehmerregelung nach § 19 UStG ist wie angefragt voreingestellt (Berechtigung prüfen; Kleingewerbe allein genügt nicht). Das Theme zeigt einen passenden Preishinweis.

Bestellungen: WooCommerce > Bestellungen. Neue Barbestellungen stehen in Bearbeitung; erst nach Übergabe und Geldeingang abschließen. Die WooCommerce-App kann nach Verbindung mit www.candycorner-essen.de Push-Mitteilungen an Handy/iPad senden. SMTP für Bestell-E-Mails separat einrichten.

Optionaler 18+-Hinweis: Produkte > Produktdaten > Allgemein. Selbstauskunft pro Sitzung, kein Altersnachweis. Keine Beispielprodukte sind markiert.

Mehrere Domains: docker/MULTISITE.md erklärt ein optionales neues WordPress-Netzwerk. Standardmäßig bleibt die Installation ein einzelner Shop.
