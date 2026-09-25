<?php
/** Local delivery with cash on handover or the official PayPal gateway. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function candy_configure_business() {
 $settings = candy_settings();
 if ( ! $settings['postcodes'] ) { $settings['postcodes'] = implode( "\n", candy_essen_postcodes() ); }
 update_option( 'candy_corner_delivery', $settings );
 update_option( 'woocommerce_cod_settings', array_merge( get_option( 'woocommerce_cod_settings', array() ), array(
  'enabled' => 'yes', 'title' => 'Barzahlung bei Übergabe',
  'description' => 'Wir bringen deine Bestellung persönlich vorbei. Du bezahlst bar bei Übergabe. Bei Abholung bezahlst du im Laden.',
  'instructions' => 'Bitte halte den Bestellbetrag bei der Übergabe bar bereit. Deine Bestellung ist erst nach Barzahlung bezahlt.',
  'enable_for_methods' => array( 'candy_corner_delivery', 'candy_corner_pickup' ), 'enable_for_virtual' => 'no',
 ) ) );
 update_option( 'woocommerce_default_country', 'DE' );
 update_option( 'woocommerce_checkout_phone_field', 'required' );
 update_option( 'woocommerce_allowed_countries', 'specific' );
 update_option( 'woocommerce_specific_allowed_countries', array( 'DE' ) );
 update_option( 'woocommerce_ship_to_countries', 'specific' );
 update_option( 'woocommerce_specific_ship_to_countries', array( 'DE' ) );
 if ( 'yes' === $settings['small_business'] ) { update_option( 'woocommerce_calc_taxes', 'no' ); }
 update_option( 'candy_business_version', '1' );
}
// One migration per site; does not activate the service or publish stock.
add_action( 'init', function() {
 if ( class_exists( 'WooCommerce' ) && '1' !== get_option( 'candy_business_version' ) ) { candy_configure_business(); }
}, 20 );
add_filter( 'woocommerce_available_payment_gateways', function( $gateways ) {
 if ( is_admin() && ! wp_doing_ajax() ) { return $gateways; }
 return array_intersect_key( $gateways, array_flip( candy_payment_methods() ) );
}, 100 );
add_filter( 'wc_tax_enabled', function( $enabled ) { return 'yes' === candy_settings()['small_business'] ? false : $enabled; } );
function candy_tax_notice() {
 if ( 'yes' === candy_settings()['small_business'] ) {
  echo '<p class="candy-tax-note">Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>';
 }
}
add_action( 'woocommerce_single_product_summary', 'candy_tax_notice', 11 );
add_action( 'woocommerce_after_cart_totals', 'candy_tax_notice' );
add_action( 'woocommerce_review_order_after_payment', 'candy_tax_notice' );
add_action( 'woocommerce_email_after_order_table', function( $order, $sent_to_admin, $plain_text ) {
 if ( 'yes' !== $order->get_meta( '_candy_small_business' ) ) { return; }
 echo $plain_text ? "\nGemäß § 19 UStG wird keine Umsatzsteuer berechnet.\n" : '<p>Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>';
}, 10, 3 );
add_filter( 'woocommerce_checkout_fields', function( $fields ) {
 $fields['billing']['billing_phone']['required'] = true;
 $fields['billing']['billing_phone']['label'] = 'Telefon für Rückfragen zur Lieferung';
 return $fields;
} );

function candy_fulfilment_error( $methods, $postcode, $country ) {
 $settings = candy_settings();
 if ( 'yes' !== $settings['enabled'] ) { return 'Der Bestellservice ist noch nicht freigeschaltet.'; }
 if ( ! $methods ) { return 'Bitte wähle eine gültige Lieferart und prüfe deine Postleitzahl.'; }
 foreach ( $methods as $method ) {
  if ( 'candy_corner_pickup' === $method ) {
   if ( ! WC()->session || 'pickup' !== WC()->session->get( 'candy_fulfilment' ) || ! trim( $settings['pickup_address'] ) ) { return 'Bitte wähle die Abholung zuerst auf der Startseite. Ohne bestätigte Abholadresse ist keine Abholung möglich.'; }
  } elseif ( 'candy_corner_delivery' === $method ) {
   $result = candy_check_postcode( $postcode, $country );
   if ( ! $result['available'] ) { return $result['message']; }
  } else { return 'Candy Corner bietet ausschließlich persönliche Lieferung in Essen oder Abholung an.'; }
 }
 return '';
}
add_action( 'woocommerce_after_checkout_validation', function( $data, $errors ) {
 $shipping = ! empty( $data['ship_to_different_address'] );
 $message = candy_fulfilment_error( $data['shipping_method'] ?? array(), $data[ $shipping ? 'shipping_postcode' : 'billing_postcode' ] ?? '', $data[ $shipping ? 'shipping_country' : 'billing_country' ] ?? '' );
 if ( $message ) { $errors->add( 'candy_delivery', $message ); }
 if ( ! in_array( $data['payment_method'] ?? '', candy_payment_methods(), true ) ) { $errors->add( 'candy_payment', 'Bitte wähle eine verfügbare Zahlungsart: Barzahlung oder PayPal.' ); }
}, 10, 2 );
function candy_validate_order( $order ) {
 $methods = array();
 foreach ( $order->get_shipping_methods() as $item ) { $methods[] = $item->get_method_id(); }
 $message = candy_fulfilment_error( $methods, $order->get_shipping_postcode(), $order->get_shipping_country() );
 if ( ! $message && ! in_array( $order->get_payment_method(), candy_payment_methods(), true ) ) { $message = 'Bitte wähle eine verfügbare Zahlungsart: Barzahlung oder PayPal.'; }
 if ( ! $message && ! trim( $order->get_billing_phone() ) ) { $message = 'Bitte gib eine Telefonnummer für Rückfragen zur Lieferung ein.'; }
 if ( $message ) { throw new Exception( $message ); }
 $order->update_meta_data( '_candy_small_business', candy_settings()['small_business'] );
 $order->update_meta_data( '_candy_fulfilment', in_array( 'candy_corner_pickup', $methods, true ) ? 'Abholung' : 'Persönliche Lieferung in Essen' );
}
add_action( 'woocommerce_checkout_create_order', 'candy_validate_order', 20 );
// Store API uses a separate checkout path. Validate its final order before payment, too.
add_action( 'woocommerce_store_api_checkout_update_order_from_request', function( $order ) {
 try { candy_validate_order( $order ); }
 catch ( Exception $error ) { throw new Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'candy_order_invalid', $error->getMessage(), 400 ); }
}, 20 );
add_action( 'woocommerce_admin_order_data_after_order_details', function( $order ) {
 if ( 'cod' === $order->get_payment_method() ) {
  echo '<p><strong>Barzahlung:</strong> Erst nach Übergabe und Geldeingang als „Abgeschlossen“ markieren.</p>';
 }
} );

// Availability/account checks remain the payment plugin's responsibility.
function candy_payment_methods() { return array( 'cod', 'ppcp-gateway' ); }
// Require the regular checkout: no product, cart or block-express shortcuts.
add_filter( 'woocommerce_paypal_payments_selected_button_locations', function( $locations ) {
 return array_values( array_intersect( $locations, array( 'checkout' ) ) );
}, 100 );
add_filter( 'woocommerce_paypal_payments_should_render_pay_later_messaging', '__return_false' );
add_filter( 'woocommerce_paypal_payments_disabled_funding', function( $funding ) {
 return array_values( array_unique( array_merge( $funding, array( 'paylater', 'credit', 'card' ) ) ) );
} );
add_filter( 'woocommerce_paypal_payments_early_wc_checkout_validation_enabled', '__return_true' );
add_filter( 'woocommerce_paypal_payments_early_wc_checkout_account_creation_validation_enabled', '__return_true' );
