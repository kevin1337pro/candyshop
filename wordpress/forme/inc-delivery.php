<?php
/** Candy Corner fulfilment. Settings, PLZ check and checkout share the same rules. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function candy_essen_postcodes() {
 static $codes;
 if ( null === $codes ) { $codes = json_decode( file_get_contents( get_template_directory() . '/data/essen-postcodes.json' ), true ) ?: array(); }
 return $codes;
}
function candy_settings() {
 return wp_parse_args( get_option( 'candy_corner_delivery', array() ), array( 'enabled' => 'no', 'postcodes' => implode( "\n", candy_essen_postcodes() ), 'pickup_label' => 'Essen-Zentrum', 'pickup_address' => '', 'minimum' => '20.00', 'fee' => '5.00', 'small_business' => 'yes' ) );
}
function candy_postcodes( $settings = null ) {
 $settings = $settings ?: candy_settings();
 return array_values( array_intersect( preg_split( '/[\s,;]+/', trim( $settings['postcodes'] ) ), candy_essen_postcodes() ) );
}
function candy_check_postcode( $postcode, $country = 'DE' ) {
 $settings = candy_settings();
 if ( ! preg_match( '/^\d{5}$/D', $postcode ) ) { return array( 'available' => false, 'message' => 'Bitte gib eine gültige fünfstellige Postleitzahl ein.' ); }
 if ( 'yes' !== $settings['enabled'] || ! candy_postcodes( $settings ) ) { return array( 'available' => false, 'message' => 'Unser Liefergebiet wird gerade eingerichtet. Eine Lieferzusage ist noch nicht möglich.' ); }
 $available = 'DE' === $country && in_array( $postcode, candy_postcodes( $settings ), true );
 return array( 'available' => $available, 'message' => $available ? 'Wir liefern persönlich nach ' . $postcode . '. Du bezahlst bar bei Übergabe.' : 'Diese PLZ liegt außerhalb unseres Lieferbereichs in Essen. Eine Lieferbestellung ist hier nicht möglich.' );
}
function candy_money( $value ) { return function_exists( 'wc_price' ) ? wc_price( $value ) : esc_html( number_format_i18n( (float) $value, 2 ) . ' €' ); }
function candy_delivery_ajax() {
 check_ajax_referer( 'candy_delivery', 'nonce' );
 $mode = isset( $_POST['mode'] ) ? sanitize_key( wp_unslash( $_POST['mode'] ) ) : 'delivery';
 $settings = candy_settings();
 if ( ! function_exists( 'WC' ) || ! WC()->session || ! WC()->customer ) { wp_send_json_error( array( 'message' => 'Der Shop wird gerade eingerichtet.' ), 503 ); }
 if ( 'pickup' === $mode ) {
  $result = array( 'available' => 'yes' === $settings['enabled'] && '' !== trim( $settings['pickup_address'] ), 'message' => trim( $settings['pickup_address'] ) ? 'Abholung: ' . $settings['pickup_label'] . ' – ' . $settings['pickup_address'] : 'Die genaue Abholadresse folgt zum Shopstart.' );
  if ( 'yes' !== $settings['enabled'] ) { $result['message'] = 'Abholung wird zum Shopstart freigeschaltet. Geplanter Standort: ' . $settings['pickup_label'] . '.'; }
 } else {
  $mode = 'delivery';
  $postcode = isset( $_POST['postcode'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['postcode'] ) ) ) : '';
  $result = candy_check_postcode( $postcode );
  WC()->session->set( 'candy_fulfilment', 'delivery' );
  WC()->session->set( 'chosen_shipping_methods', array( 'candy_corner_delivery' ) );
  // Replace previous eligibility even when a newly entered postcode is unavailable.
  WC()->customer->set_shipping_country( 'DE' ); WC()->customer->set_shipping_postcode( $postcode ); WC()->customer->save();
  if ( WC()->cart ) { WC()->cart->calculate_totals(); }
 }
 if ( $result['available'] ) {
  WC()->session->set( 'candy_fulfilment', $mode );
  WC()->session->set( 'chosen_shipping_methods', array( 'candy_corner_' . $mode ) );
  WC()->session->set_customer_session_cookie( true );
  if ( WC()->cart ) { WC()->cart->calculate_totals(); }
 }
 wp_send_json_success( $result );
}
add_action( 'wc_ajax_candy_delivery', 'candy_delivery_ajax' );
add_action( 'woocommerce_shipping_init', function() {
 if ( class_exists( 'Candy_Corner_Delivery' ) ) { return; }
 class Candy_Corner_Delivery extends WC_Shipping_Method {
  public function __construct() {
   $this->id = 'candy_corner_delivery'; $this->method_title = 'Candy Corner Lieferung'; $this->title = 'Lieferung'; $this->supports = array();
   $this->enabled = 'yes' === candy_settings()['enabled'] ? 'yes' : 'no';
  }
  public function calculate_shipping( $package = array() ) {
   $result = candy_check_postcode( $package['destination']['postcode'] ?? '', $package['destination']['country'] ?? '' );
   if ( ! $result['available'] ) { return; }
   $gross = (float) candy_settings()['fee'];
   $taxes = wc_tax_enabled() ? WC_Tax::calc_tax( $gross, WC_Tax::get_shipping_tax_rates(), true ) : array();
   $this->add_rate( array( 'id' => $this->id, 'label' => 'Candy Corner Lieferung', 'cost' => max( 0, $gross - array_sum( $taxes ) ), 'taxes' => $taxes, 'package' => $package ) );
  }
 }
 class Candy_Corner_Pickup extends WC_Shipping_Method {
  public function __construct() {
   $this->id = 'candy_corner_pickup'; $this->method_title = 'Candy Corner Abholung'; $this->title = 'Abholung'; $this->supports = array();
   $this->enabled = 'yes' === candy_settings()['enabled'] ? 'yes' : 'no';
  }
  public function calculate_shipping( $package = array() ) {
   $settings = candy_settings();
   if ( '' === trim( $settings['pickup_address'] ) || ! WC()->session || 'pickup' !== WC()->session->get( 'candy_fulfilment' ) ) { return; }
   $this->add_rate( array( 'id' => $this->id, 'label' => 'Abholung – ' . $settings['pickup_label'] . ', ' . $settings['pickup_address'], 'cost' => 0, 'taxes' => false, 'package' => $package ) );
  }
 }
} );
add_filter( 'woocommerce_shipping_methods', function( $methods ) { $methods['candy_corner_delivery'] = 'Candy_Corner_Delivery'; $methods['candy_corner_pickup'] = 'Candy_Corner_Pickup'; return $methods; } );
// Include the actual rules in the package hash: two edits in the same second
// must invalidate old session rates, too (the core transient uses seconds).
add_filter( 'woocommerce_cart_shipping_packages', function( $packages ) {
 $revision = hash( 'sha256', wp_json_encode( candy_settings() ) );
 foreach ( $packages as &$package ) { $package['candy_rules_revision'] = $revision; $package['candy_fulfilment'] = WC()->session ? WC()->session->get( 'candy_fulfilment', 'delivery' ) : 'delivery'; }
 unset( $package );
 return $packages;
} );
// Opt-in local service: alternative configured methods cannot bypass its PLZ restriction.
add_filter( 'woocommerce_package_rates', function( $rates ) {
 if ( 'yes' !== candy_settings()['enabled'] ) { return array(); }
 return array_filter( $rates, function( $rate ) { return in_array( $rate->get_method_id(), array( 'candy_corner_delivery', 'candy_corner_pickup' ), true ); } );
}, 100 );
add_filter( 'woocommerce_shipping_chosen_method', function( $chosen, $rates ) {
 if ( 'yes' !== candy_settings()['enabled'] || ! WC()->session ) { return $chosen; }
 $preferred = 'candy_corner_' . WC()->session->get( 'candy_fulfilment', 'delivery' );
 return isset( $rates[$preferred] ) ? $preferred : $chosen;
}, 10, 2 );
add_filter( 'woocommerce_local_pickup_methods', function( $methods ) { $methods[] = 'candy_corner_pickup'; return array_unique( $methods ); } );
function candy_minimum_error( $cart ) {
 if ( 'yes' !== candy_settings()['enabled'] || ! $cart || $cart->is_empty() ) { return ''; }
 $minimum = (int) round( (float) candy_settings()['minimum'] * 100 );
 // Discounted goods including tax, excluding shipping and other fees.
 $goods = (int) round( ( $cart->get_cart_contents_total() + $cart->get_cart_contents_tax() ) * 100 );
 return $goods < $minimum ? sprintf( 'Der Mindestbestellwert beträgt %s ohne Lieferkosten. Es fehlen noch %s.', wp_strip_all_tags( candy_money( $minimum / 100 ) ), wp_strip_all_tags( candy_money( ( $minimum - $goods ) / 100 ) ) ) : '';
}
add_action( 'woocommerce_check_cart_items', function() { $message = candy_minimum_error( WC()->cart ); if ( $message && ! wc_has_notice( $message, 'error' ) ) { wc_add_notice( $message, 'error' ); } } );
add_action( 'woocommerce_store_api_cart_errors', function( $errors, $cart ) { $message = candy_minimum_error( $cart ); if ( $message ) { $errors->add( 'candy_minimum_order', $message ); } }, 10, 2 );
// Bust WooCommerce's shipping cache after changing eligibility, address or price.
add_action( 'update_option_candy_corner_delivery', function() { if ( class_exists( 'WC_Cache_Helper' ) ) { WC_Cache_Helper::get_transient_version( 'shipping', true ); } } );
