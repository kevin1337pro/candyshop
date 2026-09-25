# Candy Corner Bildnachweise und WebP

- `candy-corner-logo.webp`: bereitgestelltes Candy-Corner-Logo, inhaltlich unverändert, als WebP exportiert. Breiten 192, 384 und 768 Pixel.
- `candy-hero.webp`: mit image_gen erzeugtes Candy-Kampagnenbild. Breiten 480, 768, 1152 und 1536 Pixel, Seitenverhältnis 3:2.
- `rainbow-bears.webp`, `sour-rainbow-belts.webp`, `double-choco-cookie.webp`, `blue-raspberry.webp`: vier Motive aus dem ursprünglichen 2×2-Produktfotobogen, einzeln ausgeschnitten. Quadratische Varianten mit 240, 480 und 627 Pixeln. Echte Bild-Tags statt CSS-Hintergrundatlas.

Auslieferung in `public/images/` (Vorschau) und `wordpress/forme/assets/` (WordPress). Die unveränderten PNG-Originale liegen einmalig in `assets-source/`, außerhalb der öffentlichen Dateien und des Docker-Build-Kontexts. Keine externen Bilddienste erforderlich.

Exakte ursprüngliche Prompts: [CANDY-IMAGE-PROMPTS.md](CANDY-IMAGE-PROMPTS.md). Die Produktbilder stellen KI-Produktkonzepte dar und müssen vor tatsächlichem Verkauf durch zutreffende Produktabbildungen ersetzt werden. Keine Drittmarken oder Fotos der Referenzseite übernommen.

## Gemessene Dateigrößen

Die drei PNG-Originale zusammen: **6.229.998 Bytes**. Logo, Kampagnenbild und alle vier einzelnen Produktmotive als jeweils größte ausgelieferte WebP-Datei zusammen: **457.406 Bytes**, also **92,7 % weniger Bilddaten**. Kleinere Geräte können über `srcset` kleinere Dateien wählen. Die zusätzliche Summe aller Auflösungen auf dem Server ist nicht mit den übertragenen Dateien einer einzelnen Seitenansicht gleichzusetzen. Die Zahlen beschreiben Bilddateien, keine gemessene Ladezeit.

Einzelgrößen: [image-sizes.json](image-sizes.json). Reproduzierbarer Export: `scripts/optimize-images.mjs`, Sharp 0.35.x. Bei lokal installiertem Sharp: `node scripts/optimize-images.mjs`; alternativ `CANDY_SHARP_MODULE` auf einen vorhandenen Sharp-Modulpfad setzen. Sharp wird nicht im Produktionscontainer benötigt.

Das Theme erzeugt für neue JPEG-/PNG-Uploads WebP-Untergrößen, wenn der Bildeditor des Servers WebP unterstützt. Originaluploads bleiben erhalten. Schon vorhandene eigene Medien werden nicht rückwirkend konvertiert; diese bei Bedarf sichern und neu optimieren. Keine GIF-Animationen oder fremden URLs pauschal umschreiben. [WordPress-Filter](https://developer.wordpress.org/reference/hooks/image_editor_output_format/).
