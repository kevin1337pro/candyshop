<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
add_action( 'admin_menu', function() { add_theme_page( 'FORME Einrichtung', 'FORME Einrichtung', 'manage_options', 'forme-setup', 'forme_setup_page' ); } );
function forme_setup_page() {
 if ( ! current_user_can( 'manage_options' ) ) { return; }
 $message = '';
 if ( isset( $_POST['forme_import'] ) ) {
  check_admin_referer( 'forme_demo_import' );
  if ( ! current_user_can( 'manage_woocommerce' ) || ! class_exists( 'WC_Product_Variable' ) ) { $message = 'Bitte zuerst WooCommerce aktivieren. Zum Import werden WooCommerce-Verwaltungsrechte benötigt.'; }
  else { $count = forme_import_demo_products(); $message = sprintf( '%d neue Beispielprodukte als Entwurf angelegt. Bereits vorhandene Artikel werden anhand ihrer SKU übersprungen.', $count ); }
 }
 ?><div class="wrap"><h1>FORME — dein Kleidungsshop</h1><?php if ( $message ) : ?><div class="notice notice-success"><p><?php echo esc_html( $message ); ?></p></div><?php endif; ?><p>Das Theme nutzt die native WooCommerce-Produktverwaltung, Varianten, Lagerbestände, Warenkorb, Kundenkonto und Kasse. Es ersetzt keine Zahlungs- oder Versandkonfiguration.</p><ol><li>WooCommerce installieren und dessen Einrichtung abschließen.</li><li>Unter <strong>Design → Customizer → FORME Startseite</strong> Texte und Bilder anpassen.</li><li>Unter <strong>Produkte</strong> Kleidung mit Preisen, echten Produktbildern und Größenvarianten hinzufügen.</li><li>Unter <strong>Design → Menüs</strong> Hauptnavigation sowie Service & Rechtliches zuweisen.</li><li>Zahlungsarten, Versand, Steuern und Betreibertexte für deinen Betrieb konfigurieren und einen Testkauf durchführen.</li></ol><h2>Optionale Beispielprodukte</h2><p>Legt vier Kleidungsartikel mit Größenvarianten als <strong>Entwürfe</strong> an. Die KI-Bilder, Texte und Preise sind Beispiele. Sie werden nicht automatisch veröffentlicht. Vor einer Veröffentlichung durch reale Produktinformationen ersetzen. Es werden keine bestehenden Inhalte oder Shop-Einstellungen geändert.</p><form method="post"><?php wp_nonce_field( 'forme_demo_import' ); ?><p><button class="button button-secondary" name="forme_import" value="1" type="submit">Vier Beispielprodukte als Entwurf anlegen</button></p></form></div><?php
}
function forme_import_demo_products() {
 $items = array(
 array( 'The Heavy Tee', '39.90', 'T-Shirts', 't-shirts', 'Off White', '0% 0%', array( 'XS', 'S', 'M', 'L', 'XL' ) ),
 array( 'The Boxy Jacket', '119.90', 'Jacken', 'jacken', 'Black', '100% 0%', array( 'S', 'M', 'L', 'XL' ) ),
 array( 'The Straight Denim', '79.90', 'Hosen', 'hosen', 'Indigo', '0% 100%', array( 'XS', 'S', 'M', 'L', 'XL' ) ),
 array( 'The Knit Crew', '69.90', 'Strick', 'strick', 'Chocolate', '100% 100%', array( 'XS', 'S', 'M', 'L' ) ),
 );
 $created = 0;
 foreach ( $items as $index => $item ) {
  $sku = 'FORME-DEMO-' . ( $index + 1 );
  if ( wc_get_product_id_by_sku( $sku ) ) { continue; }
  $term = term_exists( $item[3], 'product_cat' );
  if ( ! $term ) { $term = wp_insert_term( $item[2], 'product_cat', array( 'slug' => $item[3] ) ); }
  $product = new WC_Product_Variable();
  $product->set_name( $item[0] ); $product->set_status( 'draft' ); $product->set_sku( $sku );
  $product->set_description( 'Designbeispiel — vor Veröffentlichung durch tatsächliche Material-, Pflege-, Passform- und Produktangaben ersetzen. Das KI-generierte Bild ist keine verbindliche Produktdarstellung.' );
  $product->set_short_description( $item[4] . ' / Relaxed Fit — Beispielprodukt' );
  if ( ! is_wp_error( $term ) && $term ) { $product->set_category_ids( array( (int) ( is_array( $term ) ? $term['term_id'] : $term ) ) ); }
  $attribute = new WC_Product_Attribute(); $attribute->set_name( 'Größe' ); $attribute->set_options( $item[6] ); $attribute->set_visible( true ); $attribute->set_variation( true );
  $color = new WC_Product_Attribute(); $color->set_name( 'Farbe' ); $color->set_options( array( $item[4] ) ); $color->set_visible( true ); $color->set_variation( false );
  $product->set_attributes( array( $attribute, $color ) );
  $product->update_meta_data( '_forme_demo_position', $item[5] );
  $id = $product->save();
  foreach ( $item[6] as $size ) {
   $variation = new WC_Product_Variation(); $variation->set_parent_id( $id ); $variation->set_status( 'publish' ); $variation->set_attributes( array( sanitize_title( 'Größe' ) => $size ) );
   $variation->set_regular_price( $item[1] ); $variation->set_manage_stock( true ); $variation->set_stock_quantity( 0 ); $variation->set_stock_status( 'outofstock' );
   $variation->save();
  }
  WC_Product_Variable::sync( $id );
  $created++;
 }
 return $created;
}
