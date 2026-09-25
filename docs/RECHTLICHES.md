# Rechtliche Einrichtung — Candy Corner

**Bearbeitungsstand 25.09.2026.** Der Betreiber hat die Anwendung von § 19 UStG bestätigt und ausdrücklich Platzhalter für seine Identität gewünscht. Die Vorlagen sind deshalb **Entwürfe**, keine fertig geprüften oder pauschal rechtssicheren Rechtstexte. Annahme: Verkauf von Süßigkeiten, Snacks und alkoholfreien Getränken an Verbraucher in Deutschland, persönliche Lieferung in Essen und Abholung. Ein anderes Sortiment erfordert zusätzliche Prüfung.

## Enthaltene Vorlagen und Funktionen

Unter `wordpress/forme/legal/` liegen Impressum, Datenschutz, AGB/Kundeninformationen, Widerrufsbelehrung einschließlich gesetzlichem Musterformular sowie die Seite für den elektronischen Widerruf. Unter **Design → Rechtstexte & PayPal** lassen sie sich als WordPress-Entwürfe importieren und bearbeiten. Der Import ist wiederholbar, ohne vorhandene Seiten zu überschreiben. Seiten mit `[[PLATZHALTERN]]` bleiben beim Veröffentlichungsversuch Entwürfe. Zusätzlich sämtliche „ENTWURF“- und Bearbeitungshinweise entfernen.

Nach Veröffentlichung erscheinen die importierten Seiten im Footer; Datenschutz und AGB werden mit den WordPress-/WooCommerce-Optionen verbunden. Bestehende eigene Texte können weiterverwendet werden, müssen aber inhaltlich abgeglichen und verlinkt werden. Der Bestellbutton heißt „Zahlungspflichtig bestellen“, im klassischen Checkout per PHP-Filter und im Block-Checkout per offizieller WooCommerce-Filter-API. Auf dem Zielserver auch bei PayPal die tatsächliche Buttonbeschriftung und unmittelbare Darstellung von Eigenschaften, Menge, Gesamtpreis und Lieferkosten vor dem Button prüfen.

Veröffentlichte AGB und Widerrufsbelehrung werden pro neuer Bestellung als Textstand gespeichert und in Kunden-Bestellmails mit ausgegeben. Das Theme verändert bestehende Bestelltexte nicht nachträglich. Es ersetzt kein Rechnungsprogramm; erforderliche Rechnungsangaben und Nummernkreise separat einrichten. Zahlungsbestätigungen sind nicht automatisch steuerlich vollständige Rechnungen.

## Vor Veröffentlichung konkret ergänzen

- **Betreiber:** bürgerlicher Vor-/Nachname des Einzelunternehmers, ladungsfähige Geschäftsanschrift, geschäftliche E-Mail und Telefon. Gegebenenfalls tatsächlicher Registereintrag, USt-IdNr. und/oder W-IdNr. Keine private Steuernummer ins Impressum. „Candy Corner“ allein genügt nicht als Betreibername.
- **Lieferbetrieb:** vollständige Abhol- und Rücksendeadresse, verbindliche Liefer-/Abholfristen und Bestellzeiten. Der Standort „Essen-Zentrum“ ist keine ladungsfähige Adresse. Lieferzeiten zusätzlich vor Bestellabschluss sichtbar machen. Die Vorlage legt die unmittelbaren Rücksendekosten beim wirksam belehrten Kunden; falls der Betreiber diese übernehmen will, Text entsprechend ändern.
- **Vertragsschluss:** tatsächlichen Zeitpunkt der Annahme mit WooCommerce-E-Mails und PayPal-Belastung abstimmen; die entsprechende Passage ist bewusst ein Platzhalter. Gesetzliche Mängelrechte bleiben bestehen, keine pauschalen Haftungs-/Rückgabeausschlüsse verwenden. AGB sind nicht generell gesetzlich vorgeschrieben; vorvertragliche Pflichtinformationen sind es.
- **Datenschutz:** realen Hosting- und Mailanbieter, Speicherorte, Auftragsverarbeitungsverträge, Log-/Löschfristen, Backups, Kontoeinstellungen und sämtliche aktivierten Plugins erheben. Gegebenenfalls Woo-App/Push/Automattic und Drittlandtransfers ergänzen. Keine erfundenen Anbieter, Verträge oder Löschfristen veröffentlichen.
- **PayPal:** erst nach Kontoanbindung endgültigen Funktions-/Cookieumfang bestimmen. Keine pauschale Aussage „nur notwendige Cookies“, solange SDK/FraudNet, Statistik oder weitere Plugins ungeprüft sind. Einwilligungspflichtige Zugriffe vor Zustimmung technisch unterbinden; das Theme enthält kein universelles Consent-Management. Hosting-/Plugin-Angaben wurden noch nicht mitgeteilt.
- **Streitbeilegung:** Teilnahmebereitschaft/-pflicht nach VSBG individuell klären. Die frühere EU-OS-Plattform wurde zum 20.07.2025 eingestellt; kein veralteter OS-Link eingebaut. Die eigenständigen VSBG-Pflichten entfallen dadurch nicht.
- **Barrierefreiheit:** Onlinehandel ist grundsätzlich vom BFSG erfasst. Für Dienstleistungen von Kleinstunternehmen gibt es eine Ausnahme (weniger als zehn Beschäftigte und Jahresumsatz oder Bilanzsumme höchstens 2 Mio. €). „Kleingewerbe“ oder § 19 UStG allein belegen diese Ausnahme nicht. Voraussetzungen dokumentieren; falls nicht erfüllt, Anforderungen und Informationen nach Anlage 3 BFSG umsetzen. Keine unbelegte Konformitätserklärung veröffentlichen.

## Lebensmittel, Preise und Verpackung

Für die **echten** Produkte vor dem Kauf die jeweils erforderlichen Lebensmittelangaben in deutscher Sprache bereitstellen: Bezeichnung, Zutaten, hervorgehobene Allergene, Nettofüllmenge, Nährwerte soweit erforderlich, verantwortlicher Lebensmittelunternehmer und gegebenenfalls Herkunft, Lagerung, Gebrauchshinweise oder besondere Warnhinweise. Bei vorverpackter Ware müssen im Fernabsatz grundsätzlich die Pflichtinformationen vor Vertragsschluss verfügbar sein, mit der Ausnahme für Mindesthaltbarkeits-/Verbrauchsdatum nach Art. 14 LMIV; bei Lieferung müssen die erforderlichen Angaben vollständig vorhanden sein. Für lose Ware gelten eigene Regeln. Angaben niemals aus KI-Bildern ableiten.

Bei Verkauf nach Gewicht/Volumen erforderlichen **Grundpreis je kg bzw. Liter** gut erkennbar am Produkt angeben; nicht mit der §-19-Steuerbefreiung verwechseln. Bei pfandpflichtigen Getränken Pfand korrekt separat ausweisen und berechnen. Steuerstatus, korrekte Mengen/Grundpreise, Rabatte und Gesamtpreise an Produkt, Warenkorb und Kasse kontrollieren. Das Theme enthält keine automatische LMIV-Datenbank oder Pfandverwaltung; dafür Produkte/geeignete Erweiterung konfigurieren. VerpackG-/LUCID- und Systembeteiligungspflichten mit den tatsächlich eingesetzten Verkaufs-/Service-/Versandverpackungen prüfen; persönliche Autofahrt beseitigt diese Pflichten nicht automatisch. Lebensmittelbetrieb/örtliche Überwachung und Hygieneanforderungen ebenfalls mit dem Betreiber klären.

Normale haltbare Süßigkeiten sind nicht pauschal vom Widerruf ausgeschlossen. Ausnahmen gelten nur bei den konkreten gesetzlichen Voraussetzungen, z. B. schneller Verderb oder bestimmte nach Lieferung entsiegelte Hygieneartikel. Die vorhandene 18+-Selbstauskunft ersetzt keine gesetzlich erforderliche Altersprüfung. Dieses Paket enthält keine Freigabe für Tabak, Vapes, Alkohol oder andere regulierte Waren.

## Elektronischer Widerruf (§ 356a BGB)

Seite „Vertrag widerrufen“ veröffentlichen. Der hervorgehobene Footer-Link führt ohne Anmeldung zum Formular. Schritt 1 erfasst Namen, Vertragsangabe (auch Freitext/Teilwiderruf) und E-Mail. Schritt 2 zeigt die Erklärung und den Button **„Widerruf bestätigen“**. Der Server speichert den Inhalt und Eingang mit Zeitzone privat; Kunden und Betreiber erhalten die Eingangsbestätigung per E-Mail. Eine unbekannte Bestellnummer wird nicht automatisch zurückgewiesen, und es erfolgt keine automatische Erstattung. Inhaltliche Prüfung/Erstattung durch den Betreiber.

Die Erklärung bleibt bei einem Mailfehler gespeichert. Es gibt eine Admin-Warnung und WP-Cron-Wiederholungen. Das erfüllt die Pflicht zur unverzüglichen Übermittlung nur bei **tatsächlich funktionierendem Mailversand**: SMTP, Zustellbarkeit und Cron auf dem Server einrichten und überwachen. Ein `wp_mail()`-Erfolg bestätigt nur die Übergabe an den Mailtransport. Shop-Manager müssen Widerrufe und Fehlerhinweise bearbeiten können. Proxy-Cache darf Formular und POST-Anfragen nicht zwischenspeichern. Der Betreiber legt angemessene Aufbewahrungs-/Löschfristen fest; Widerrufe sind personenbezogene Daten.

Vor Livebetrieb: Gast-Widerruf vollständig durchführen, eingegangene Nachricht und Zeitstempel prüfen, Form auch auf Handy und per Tastatur bedienen, Teilwiderruf testen, anschließend Testdaten löschen. Die gesetzlichen anderen Widerrufswege bleiben offen.

## Primärquellen

- [§ 5 DDG – Anbieterinformationen](https://www.gesetze-im-internet.de/ddg/__5.html)
- [Art. 246a § 1 EGBGB – vorvertragliche Informationen](https://www.gesetze-im-internet.de/bgbeg/art_246a__1.html)
- [§ 19 UStG – Kleinunternehmerregelung](https://www.gesetze-im-internet.de/ustg_1980/__19.html)
- [§ 356a BGB – elektronische Widerrufsfunktion](https://www.gesetze-im-internet.de/bgb/__356a.html)
- [Gesetzliches Muster der Widerrufsbelehrung](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_1.html), [Musterformular](https://www.gesetze-im-internet.de/bgbeg/art_253anlage_2.html), [§ 312g BGB – Ausnahmen](https://www.gesetze-im-internet.de/bgb/__312g.html)
- [BfDI: DSGVO einschließlich Art. 13 und 14](https://www.bfdi.bund.de/SharedDocs/Downloads/DE/Broschueren/INFO1.pdf?__blob=publicationFile&v=16), [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [§ 4 PAngV – Grundpreise](https://www.gesetze-im-internet.de/pangv_2022/__4.html), [BMLEH zur Lebensmittelkennzeichnung](https://www.bmel.de/DE/themen/ernaehrung/lebensmittel-kennzeichnung/pflichtangaben/lebensmittelkennzeichnung-wichtigsten-vorgaben-lmiv.html)
- [EU-Kommission zur Einstellung der OS-Plattform](https://consumer-redress.ec.europa.eu/site-relocation_en), [§ 36 VSBG](https://www.gesetze-im-internet.de/vsbg/__36.html)
- [Bundesfachstelle Barrierefreiheit – BMAS-Leitlinien](https://www.bundesfachstelle-barrierefreiheit.de/SharedDocs/Downloads/DE/Externe-Veroeffentlichungen/bmas-leitlinien-bfsg?nn=69281612401de22f3aa2b6be)

Die Quellen bilden den recherchierten Stand ab. Die Vorlagen müssen vor Verwendung anhand des vollständigen Sortiments, Betriebsablaufs und eingesetzter Dienste rechtlich geprüft werden; spätere Rechtsänderungen erfordern Pflege.
