<?php
/** Editable legal drafts. Existing operator pages are never overwritten. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function candy_legal_templates() {
 return array( 'impressum' => 'Impressum', 'datenschutz' => 'Datenschutz', 'widerruf' => 'Widerrufsbelehrung & Musterformular', 'bestellbedingungen' => 'AGB & Kundeninformationen', 'vertrag-widerrufen' => 'Vertrag widerrufen' );
}
function candy_import_legal_drafts() {
 $ids = get_option( 'candy_legal_pages', array() );
 foreach ( candy_legal_templates() as $slug => $title ) {
  if ( ! empty( $ids[$slug] ) && get_post( $ids[$slug] ) ) { continue; }
  // Do not silently take over a pre-existing legal page with the same slug.
  $existing = get_page_by_path( $slug );
  $id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'draft', 'post_title' => $title . ( $existing ? ' – neuer Entwurf' : '' ), 'post_name' => $slug, 'post_content' => file_get_contents( __DIR__ . '/legal/' . $slug . '.html' ), 'meta_input' => array( '_candy_legal_template' => $slug ) ), true );
  if ( ! is_wp_error( $id ) ) { $ids[$slug] = $id; }
 }
 update_option( 'candy_legal_pages', $ids );
 return $ids;
}
function candy_legal_page( $slug ) {
 $ids = get_option( 'candy_legal_pages', array() );
 $page = empty( $ids[$slug] ) ? null : get_post( $ids[$slug] );
 return $page && 'publish' === $page->post_status ? $page : null;
}
add_action( 'admin_menu', function() {
 add_theme_page( 'Rechtstexte & PayPal', 'Rechtstexte & PayPal', 'manage_options', 'candy-legal', 'candy_legal_admin' );
} );
function candy_legal_admin() {
 if ( ! current_user_can( 'manage_options' ) ) { return; }
 if ( isset( $_POST['candy_import_legal'] ) ) { check_admin_referer( 'candy_import_legal' ); candy_import_legal_drafts(); }
 echo '<div class="wrap"><h1>Rechtstexte & PayPal</h1><p>Stand 25.09.2026. Die Kleinunternehmerregelung ist bestätigt. Diese Vorlagen ersetzen keine Prüfung des konkreten Betriebs. Alle [[PLATZHALTER]] und Bearbeitungshinweise vor Veröffentlichung ersetzen. Bestehende Texte werden nicht überschrieben.</p><form method="post">';
 wp_nonce_field( 'candy_import_legal' );
 echo '<button class="button button-primary" name="candy_import_legal" value="1">Rechtstexte als Entwürfe anlegen</button></form><ul>';
 foreach ( get_option( 'candy_legal_pages', array() ) as $id ) {
  $p = get_post( $id ); if ( $p ) { echo '<li><a href="' . esc_url( get_edit_post_link( $id ) ) . '">' . esc_html( $p->post_title ) . '</a> — ' . esc_html( $p->post_status ) . '</li>'; }
 }
 echo '</ul><p>Nach Veröffentlichung werden die Seiten automatisch im Footer verlinkt. Datenschutz und AGB werden zusätzlich mit WooCommerce verknüpft. Die veröffentlichte Widerrufsbelehrung und AGB werden als Textstand an Bestellungen gespeichert und in Kunden-Bestellmails mitgeliefert.</p><p><strong>Vor Freischaltung:</strong> Lieferzeiten in der Kasse sichtbar ergänzen, Lebensmittel- und Grundpreisangaben prüfen, zuverlässigen SMTP-Versand einrichten und den elektronischen Widerruf einschließlich Kundenbestätigung testen. Hinweise: docs/RECHTLICHES.md im Repository.</p><h2>PayPal verbinden</h2><ol><li>PayPal-Geschäftskonto anlegen und verifizieren.</li><li>WooCommerce → Einstellungen → Zahlungen → PayPal: eigenes Konto über den offiziellen Verbindungsdialog verbinden.</li><li>Sandbox-Zahlung, Abbruch, Erstattung und Webhook-Verbindung prüfen, danach bewusst auf Live umstellen.</li></ol><p>Das Plugin ist kostenlos. PayPal Checkout kostet laut deutscher Standardtabelle vom 07.09.2026 für EUR-Inlandszahlungen 2,99 % + 0,39 € pro Zahlung. Kontoabhängige Konditionen und Zuschläge können abweichen. Das gilt auch für PayPal-Zahlungen ohne Karte.</p><p><a class="button" href="' . esc_url( admin_url( 'admin.php?page=wc-settings&tab=checkout' ) ) . '">Zahlungen einrichten</a></p></div>';
}
// Prevent an accidental publication of unresolved draft placeholders.
add_filter( 'wp_insert_post_data', function( $data, $postarr ) {
 $slug = $postarr['meta_input']['_candy_legal_template'] ?? ( empty( $postarr['ID'] ) ? '' : get_post_meta( $postarr['ID'], '_candy_legal_template', true ) );
 if ( $slug && in_array( $data['post_status'], array( 'publish', 'future' ), true ) && false !== strpos( $data['post_content'], '[[' ) ) { $data['post_status'] = 'draft'; }
 return $data;
}, 10, 2 );
add_action( 'transition_post_status', function( $new, $old, $post ) {
 if ( 'publish' !== $new ) { return; }
 $slug = get_post_meta( $post->ID, '_candy_legal_template', true );
 if ( 'datenschutz' === $slug ) { update_option( 'wp_page_for_privacy_policy', $post->ID ); }
 if ( 'bestellbedingungen' === $slug ) { update_option( 'woocommerce_terms_page_id', $post->ID ); }
}, 10, 3 );
function candy_legal_links() {
 foreach ( candy_legal_templates() as $slug => $label ) {
  $page = candy_legal_page( $slug );
  if ( $page ) { echo '<a' . ( 'vertrag-widerrufen' === $slug ? ' class="candy-withdrawal-link"' : '' ) . ' href="' . esc_url( get_permalink( $page ) ) . '">' . esc_html( $label ) . '</a>'; }
 }
}
add_shortcode( 'candy_delivery_terms', function() {
 $s = candy_settings();
 return 'Der Mindestbestellwert beträgt ' . candy_money( $s['minimum'] ) . ' nach Rabatten und ohne Lieferkosten. Für persönliche Lieferung kommen ' . candy_money( $s['fee'] ) . ' hinzu. Bei ausdrücklich gewählter Abholung fallen keine Lieferkosten an. Der Mindestbestellwert gilt auch für Abholung.';
} );
function candy_legal_snapshot( $order ) {
 if ( $order->get_meta( '_candy_legal_text' ) ) { return; }
 $texts = array();
 foreach ( array( 'bestellbedingungen', 'widerruf' ) as $slug ) {
  $page = candy_legal_page( $slug );
  if ( $page ) { $texts[] = $page->post_title . "\n\n" . html_entity_decode( wp_strip_all_tags( preg_replace( '/<\/(p|h[1-6]|li)>/i', "$0\n\n", do_shortcode( $page->post_content ) ) ), ENT_QUOTES, 'UTF-8' ); }
 }
 if ( $texts ) { $order->update_meta_data( '_candy_legal_text', implode( "\n\n", $texts ) ); }
}
add_action( 'woocommerce_checkout_create_order', 'candy_legal_snapshot', 30 );
add_action( 'woocommerce_store_api_checkout_update_order_from_request', 'candy_legal_snapshot', 30 );
add_action( 'woocommerce_email_after_order_table', function( $order, $admin, $plain ) {
 if ( $admin ) { return; }
 $text = $order->get_meta( '_candy_legal_text' );
 if ( $text ) { echo $plain ? "\n\n" . $text . "\n" : '<div class="candy-order-terms"><h2>Vertragsinformationen</h2>' . wpautop( esc_html( $text ) ) . '</div>'; }
}, 30, 3 );
add_filter( 'woocommerce_order_button_text', function() { return 'Zahlungspflichtig bestellen'; } );
add_action( 'wp_enqueue_scripts', function() {
 if ( function_exists( 'is_checkout' ) && is_checkout() && wp_script_is( 'wc-blocks-checkout', 'registered' ) ) {
  wp_enqueue_script( 'candy-checkout', get_template_directory_uri() . '/assets/checkout.js', array( 'wc-blocks-checkout' ), '2.3.0', true );
 }
}, 30 );
