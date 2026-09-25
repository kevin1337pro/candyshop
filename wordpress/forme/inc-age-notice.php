<?php
/** Optional content notice. A self-declaration is not proof of age. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function candy_product_age_notice( $product ) {
 if ( ! $product ) { return false; }
 if ( $product->is_type( 'variation' ) ) { $product = wc_get_product( $product->get_parent_id() ); }
 return $product && 'yes' === $product->get_meta( '_candy_age_notice' );
}
function candy_age_confirmed() { return WC()->session && 'yes' === WC()->session->get( 'candy_age_confirmed' ); }
add_action( 'woocommerce_product_options_general_product_data', function() {
 woocommerce_wp_checkbox( array( 'id' => '_candy_age_notice', 'label' => '18+ Hinweis anzeigen', 'description' => 'Zeigt eine freiwillige Altersbestätigung. Kein Nachweis des Alters; ersetzt keine gegebenenfalls erforderliche Altersprüfung.' ) );
} );
add_action( 'woocommerce_admin_process_product_object', function( $product ) {
 $product->update_meta_data( '_candy_age_notice', isset( $_POST['_candy_age_notice'] ) ? 'yes' : 'no' );
} );
add_action( 'wc_ajax_candy_age_confirm', function() {
 check_ajax_referer( 'candy_age_confirm', 'nonce' );
 if ( ! WC()->session || 'yes' !== ( $_POST['confirmed'] ?? '' ) ) { wp_send_json_error( null, 400 ); }
 WC()->session->set( 'candy_age_confirmed', 'yes' );
 WC()->session->set_customer_session_cookie( true );
 wp_send_json_success();
} );
add_filter( 'woocommerce_add_to_cart_validation', function( $valid, $id, $qty, $variation_id = 0 ) {
 if ( candy_product_age_notice( wc_get_product( $variation_id ?: $id ) ) && ! candy_age_confirmed() ) {
  wc_add_notice( 'Bitte bestätige auf der Produktseite zuerst, dass du mindestens 18 Jahre alt bist.', 'error' ); return false;
 }
 return $valid;
}, 10, 4 );
function candy_age_cart_error() {
 if ( ! WC()->cart || candy_age_confirmed() ) { return ''; }
 foreach ( WC()->cart->get_cart() as $item ) { if ( candy_product_age_notice( $item['data'] ) ) { return 'Dein Warenkorb enthält einen Artikel mit 18+ Hinweis. Bitte bestätige dein Alter auf dessen Produktseite.'; } }
 return '';
}
add_action( 'woocommerce_check_cart_items', function() { $message = candy_age_cart_error(); if ( $message && ! wc_has_notice( $message, 'error' ) ) { wc_add_notice( $message, 'error' ); } } );
add_action( 'woocommerce_store_api_cart_errors', function( $errors ) { $message = candy_age_cart_error(); if ( $message ) { $errors->add( 'candy_age', $message ); } } );
add_filter( 'post_class', function( $classes, $class, $id ) {
 if ( 'product' === get_post_type( $id ) && candy_product_age_notice( wc_get_product( $id ) ) ) { $classes[] = 'candy-age-notice'; }
 return $classes;
}, 10, 3 );
add_filter( 'woocommerce_loop_add_to_cart_args', function( $args, $product ) {
 if ( candy_product_age_notice( $product ) ) { $args['attributes']['data-candy-age'] = 'yes'; }
 return $args;
}, 10, 2 );
add_action( 'wp_footer', function() {
 if ( ! function_exists( 'WC' ) ) { return; }
 ?>
 <dialog id="candy-age-dialog" class="candy-age-dialog" aria-labelledby="candy-age-title" aria-describedby="candy-age-copy">
  <span class="candy-age-badge">18+</span><h2 id="candy-age-title">Bist du mindestens 18?</h2>
  <p id="candy-age-copy">Für diesen Artikel bitten wir dich um eine kurze Altersbestätigung.</p>
  <p data-age-error role="alert"></p><div class="candy-age-actions"><button type="button" class="button primary" data-age-yes>Ja, ich bin mindestens 18</button><button type="button" class="button" data-age-no>Nein, zurück</button></div>
 </dialog>
 <?php
} );
add_action( 'wp_enqueue_scripts', function() {
 if ( ! class_exists( 'WC_AJAX' ) ) { return; }
 wp_enqueue_script( 'candy-age-notice', get_template_directory_uri() . '/assets/age-notice.js', array(), '2.3.0', true );
 wp_localize_script( 'candy-age-notice', 'candyAge', array( 'url' => WC_AJAX::get_endpoint( 'candy_age_confirm' ), 'nonce' => wp_create_nonce( 'candy_age_confirm' ), 'confirmed' => candy_age_confirmed() ) );
}, 20 );
