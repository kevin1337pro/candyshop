# PayPal für Candy Corner

Stand: **25.09.2026**. Das Geschäftskonto muss laut Betreiber noch angelegt werden. Die technische Anbindung ist vorbereitet; es gibt noch keine Verbindung zu einem echten Händlerkonto.

## Kosten

| Bestandteil | Kosten |
| --- | --- |
| WordPress / WooCommerce-Grundsoftware | Keine Lizenzgebühr |
| Offizielles „WooCommerce PayPal Payments“-Plugin | Kostenlos |
| Standard-PayPal-Checkout | Keine monatliche Grund- oder Einrichtungsgebühr; Transaktionsgebühren |
| EUR-Inlandszahlung über PayPal Checkout | **2,99 % + 0,39 € je Zahlung** laut deutscher Händlertabelle, aktualisiert am 07.09.2026 |
| Server, Domain, Maildienst, ggf. weitere Erweiterungen | Separat, abhängig vom gewählten Anbieter |

Die Gebühr entsteht auch bei normalen PayPal-Zahlungen, unabhängig davon, ob der Käufer sein PayPal-Guthaben, Bankkonto oder eine Karte als Zahlungsquelle nutzt. Sie wird nicht erst bei Kartenzahlung fällig. Die Gebühr bezieht sich auf den empfangenen Gesamtbetrag einschließlich Lieferkosten. Beispiel: 20 € Waren + 5 € Lieferung = 25 €; rund **1,14 € Gebühren**, **23,86 € verbleiben**.

Andere Produkte haben andere Tarife; die Gebührenzeile „Geld für Waren und Dienstleistungen senden/empfangen“ ist nicht die Checkout-Gebühr. Internationale Zahlungen, Währungsumrechnung, Konflikte und individuelle Händlervereinbarungen können abweichen. Verbindlich sind die Konditionen des tatsächlich eröffneten Kontos. Kein Kundenaufschlag im Shop implementiert.

Quellen: [offizielle deutsche Händlertabelle](https://pep.paypal.com/de/business/paypal-business-fees), [PayPal zu Grund-/Einrichtungsgebühren](https://www.paypal.com/de/business/accept-payments/installment-payments), [kostenloses offizielles Plugin](https://woocommerce.com/products/woocommerce-paypal-payments/).

## Einrichten

1. PayPal-Geschäftskonto im Namen des tatsächlichen Geschäftsinhabers anlegen, Geschäftsdaten und Bankverbindung verifizieren.
2. Docker-Update gemäß `docker/UPDATE-2026-09.md` durchführen. Ohne Docker: offizielles Plugin „WooCommerce PayPal Payments“ installieren/aktivieren. Mitgelieferte Version: **4.1.3**, Download mit SHA-256 im Dockerfile fixiert.
3. Unter **WooCommerce → Einstellungen → Zahlungen → PayPal** das Konto über den offiziellen Einrichtungsdialog verbinden. Keine Schlüssel im Theme oder in Git ablegen.
4. Für Tests zuerst **Sandbox** aktivieren und Sandbox-Händler-/Käuferkonten verwenden. Für den Verkauf danach bewusst das Live-Konto verbinden und Sandbox ausschalten. Physische Waren wählen, keine Abonnements. Zahlungsaktion „Capture“/sofort einziehen verwenden; einen nur autorisierten Betrag nicht als eingegangen behandeln.
5. Nur den normalen PayPal-Zahlweg aktivieren. Das Theme erlaubt `cod` und `ppcp-gateway`, beschränkt Express-Buttons auf den regulären Checkout und schaltet Pay-Later-Werbung ab. Erweiterte Kartenzahlung, Fastlane, Wallets und weitere Zahlungsmethoden sind nicht Bestandteil dieser Einrichtung.
6. PayPal-Webhooks über die öffentliche HTTPS-Domain prüfen/neu abonnieren. Keine HTTP-Basic-Auth oder Firewall-Sperre vor dem Webhook. Domain ohne `:8080` verwenden. Nach einem späteren Domainwechsel PayPal-Verbindung/Webhooks erneut prüfen.
7. Datenschutz an die tatsächlichen Pluginoptionen anpassen. Externe Skripte/Cookies auf der Kasse prüfen; nicht erforderliche Verarbeitung erst nach erforderlicher Einwilligung laden. Express-/Marketing-Schalter allein sind kein Consent-System.

## Nachweis vor Livebetrieb

- Normale Barbestellung unverändert möglich; § 19 UStG: kein Umsatzsteuerausweis.
- PayPal-Zahlung mit 20 € Waren + 5 € Lieferung; nur einmalige Erfassung, Woo-Bestellung und PayPal-Transaktion stimmen überein.
- Ablehnung ungültiger Lieferadresse und Warenwert unter 20 € auch beim PayPal-Weg.
- Abbruch und fehlgeschlagene Zahlung werden nicht als bezahlt markiert.
- Erfolg bei verspäteter Browser-Rückkehr wird durch Plugin/Webhook sauber zugeordnet.
- Erstattung in Sandbox, Bestandsverhalten und Mitteilung an den Händler prüfen.
- Eine Sandbox-Bestellung ist keine Livezahlung. Bisher wurden nur lokale Integrations-/Regeltests durchgeführt; mangels Konto keine PayPal-Transaktion und kein Live-Webhook-Test.

[Offizielle Einrichtungs- und Sandbox-Anleitung](https://woocommerce.com/document/woocommerce-paypal-payments/paypal-payments-startup-guide/).
