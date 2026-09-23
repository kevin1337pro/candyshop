<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
add_action( 'admin_menu', function() { add_theme_page( 'Candy Corner Einrichtung', 'Candy Corner Einrichtung', 'manage_options', 'forme-setup', 'forme_setup_page' ); } );
add_action( 'admin_init', function() { register_setting( 'candy_corner_setup', 'candy_corner_delivery', array( 'type' => 'array', 'sanitize_callback' => 'candy_sanitize_settings' ) ); } );
function candy_sanitize_settings( $input ) {
 $old = candy_settings();
 if ( ! is_array( $input ) ) { return $old; }
 $raw = sanitize_textarea_field( $input['postcodes'] ?? '' );
 $codes = array_filter( preg_split( '/[\s,;]+/', trim( $raw ) ) );
 foreach ( $codes as $code ) { if ( ! preg_match( '/^\d{5}$/D', $code ) ) { add_settings_error( 'candy_corner_delivery', 'invalid_postcode', 'Nicht gespeichert: Jede Liefer-PLZ muss genau fünf Ziffern enthalten. Keine Platzhalter oder Bereiche verwenden.' ); return $old; } }
 foreach ( array( 'minimum', 'fee' ) as $field ) { $value = str_replace( ',', '.', $input[$field] ?? '' ); if ( ! is_numeric( $value ) || (float) $value < 0 || (float) $value > 10000 ) { add_settings_error( 'candy_corner_delivery', 'invalid_price', 'Nicht gespeichert: Preise zwischen 0 und 10.000 Euro eingeben.' ); return $old; } }
 return array( 'enabled' => ! empty( $input['enabled'] ) ? 'yes' : 'no', 'postcodes' => implode( "\n", array_unique( $codes ) ), 'pickup_label' => sanitize_text_field( $input['pickup_label'] ?? 'Essen-Zentrum' ), 'pickup_address' => sanitize_textarea_field( $input['pickup_address'] ?? '' ), 'minimum' => number_format( (float) str_replace( ',', '.', $input['minimum'] ), 2, '.', '' ), 'fee' => number_format( (float) str_replace( ',', '.', $input['fee'] ), 2, '.', '' ) );
}
function forme_setup_page() {
 if ( ! current_user_can( 'manage_options' ) ) { return; }
 $message = '';
 if ( isset( $_POST['forme_import'] ) ) {
  check_admin_referer( 'forme_demo_import' );
  if ( ! current_user_can( 'manage_woocommerce' ) || ! class_exists( 'WC_Product_Simple' ) ) { $message = 'Bitte zuerst WooCommerce aktivieren. WooCommerce-Verwaltungsrechte werden benötigt.'; }
  else { $message = sprintf( '%d neue Candy-Beispielprodukte als Entwurf angelegt. Vorhandene SKUs werden übersprungen.', forme_import_demo_products() ); }
 }
 $s = candy_settings();
 ?><div class="wrap"><h1>Candy Corner — Einrichtung</h1><?php settings_errors(); if ( $message ) : ?><div class="notice notice-success"><p><?php echo esc_html( $message ); ?></p></div><?php endif; ?>
 <p>Produkte, Bestände, Warenkorb, Kasse und Zahlungen werden von WooCommerce verwaltet. Texte und Bilder der Startseite: <strong>Design → Customizer → Candy Corner Startseite</strong>.</p>
 <h2>Lieferung & Abholung</h2><p>Die folgenden Werte gelten für die PLZ-Prüfung und für den WooCommerce-Checkout. Lieferkosten sind der Endpreis einschließlich etwaiger Steuern. Der Mindestbestellwert gilt nach Rabatten, einschließlich Warensteuer und ohne Lieferkosten, für beide Bestellarten.</p>
 <form action="options.php" method="post"><?php settings_fields( 'candy_corner_setup' ); ?><table class="form-table" role="presentation">
 <tr><th scope="row">Lieferservice aktivieren</th><td><label><input type="checkbox" name="candy_corner_delivery[enabled]" value="yes" <?php checked( $s['enabled'], 'yes' ); ?>> Candy Corner Lieferung/Abholung verwenden</label><p class="description"><strong>Ersetzt andere Versandarten, solange aktiviert.</strong> Vorhandene Versandzonen werden nicht verändert. Erst aktivieren, wenn echte Produkte, Kontaktdaten, Abholzeiten und Zahlungsarten eingerichtet sind. Ohne Liefer-PLZ keine Lieferung; ohne vollständige Abholadresse keine Abholung.</p></td></tr>
 <tr><th scope="row"><label for="candy-postcodes">Liefer-Postleitzahlen</label></th><td><textarea id="candy-postcodes" rows="6" class="regular-text" name="candy_corner_delivery[postcodes]"><?php echo esc_textarea( $s['postcodes'] ); ?></textarea><p class="description">Eine deutsche PLZ pro Zeile. Es sind noch keine Gebiete freigegeben. Nur tatsächlich bediente PLZ eintragen.</p></td></tr>
 <?php foreach ( array( 'pickup_label' => 'Abholort (Kurzname)', 'pickup_address' => 'Vollständige Abholadresse', 'minimum' => 'Mindestbestellwert (€)', 'fee' => 'Lieferkosten gesamt (€)' ) as $key => $label ) : ?><tr><th scope="row"><label for="candy-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th><td><input class="regular-text" id="candy-<?php echo esc_attr( $key ); ?>" name="candy_corner_delivery[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $s[$key] ); ?>" <?php echo in_array( $key, array( 'minimum', 'fee' ), true ) ? 'inputmode="decimal"' : ''; ?>></td></tr><?php endforeach; ?>
 </table><?php submit_button( 'Lieferdaten speichern' ); ?></form>
 <h2>Optionale Beispielprodukte</h2><p>Vier einfache Candy-Produkte als <strong>Entwürfe, Bestand 0</strong> anlegen. Bild, Preis und Produktinformationen sind Beispiele. Echte Zutaten, Allergene, Nährwerte, Mengen und erforderliche Preisangaben vor Veröffentlichung ergänzen. Bestehende Artikel werden nicht verändert.</p><form method="post"><?php wp_nonce_field( 'forme_demo_import' ); ?><button class="button button-secondary" name="forme_import" value="1">Vier Beispielprodukte als Entwurf anlegen</button></form>
 <h2>Vor dem Start</h2><ol><li>Echte Produkte und alle Produktinformationen einpflegen.</li><li>Abholadresse, Liefer-PLZ, Bestellzeiten und Kontaktseite ergänzen.</li><li>WooCommerce: Währung EUR, Shopland Deutschland, Steuern und Zahlungsarten passend zum Betrieb konfigurieren.</li><li>Service-Menü mit Betreiberseiten, Datenschutz und weiteren erforderlichen Informationen anlegen.</li><li>Lieferservice aktivieren und Lieferung innerhalb/außerhalb des Gebiets, Abholung, Mindestbestellwert, Rabatte und Zahlungen testen.</li></ol></div><?php
}
function forme_import_demo_products() {
 $items = array(
 array( 'Rainbow Bears', '4.90', 'Süßigkeiten', 'suessigkeiten', '200 g', '0% 0%' ),
 array( 'Sour Rainbow Belts', '3.90', 'Süßigkeiten', 'suessigkeiten', '150 g', '100% 0%' ),
 array( 'Double Choco Cookie', '3.50', 'Snacks', 'snacks', '1 Stück', '0% 100%' ),
 array( 'Blue Raspberry', '4.50', 'Drinks', 'drinks', '400 ml', '100% 100%' ),
 ); $created = 0;
 foreach ( $items as $index => $item ) {
  $sku = 'CANDY-CORNER-DEMO-' . ( $index + 1 ); if ( wc_get_product_id_by_sku( $sku ) ) { continue; }
  $term = term_exists( $item[3], 'product_cat' ); if ( ! $term ) { $term = wp_insert_term( $item[2], 'product_cat', array( 'slug' => $item[3] ) ); }
  $product = new WC_Product_Simple(); $product->set_name( $item[0] ); $product->set_status( 'draft' ); $product->set_sku( $sku );
  $product->set_description( 'Designbeispiel. Vor Veröffentlichung echte Zutaten, Allergene, Nährwerte, Mengen und Produktinformationen ergänzen. Das KI-Bild ist keine verbindliche Produktdarstellung.' );
  $product->set_short_description( $item[4] . ' · Beispielprodukt, noch nicht zum Verkauf freigegeben.' );
  $product->set_regular_price( $item[1] ); $product->set_manage_stock( true ); $product->set_stock_quantity( 0 ); $product->set_stock_status( 'outofstock' );
  if ( ! is_wp_error( $term ) && $term ) { $product->set_category_ids( array( (int) ( is_array( $term ) ? $term['term_id'] : $term ) ) ); }
  $product->update_meta_data( '_candy_demo_position', $item[5] ); $product->save(); $created++;
 } return $created;
}
