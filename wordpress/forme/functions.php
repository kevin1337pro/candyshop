<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
function forme_setup() {
 load_theme_textdomain( 'forme', get_template_directory() . '/languages' );
 add_theme_support( 'title-tag' );
 add_theme_support( 'post-thumbnails' );
 add_theme_support( 'custom-logo', array( 'height' => 70, 'width' => 260, 'flex-width' => true, 'flex-height' => true ) );
 add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
 add_theme_support( 'responsive-embeds' );
 add_theme_support( 'woocommerce', array( 'thumbnail_image_width' => 600, 'single_image_width' => 1000, 'product_grid' => array( 'default_columns' => 4, 'default_rows' => 3 ) ) );
 add_theme_support( 'wc-product-gallery-zoom' );
 add_theme_support( 'wc-product-gallery-lightbox' );
 add_theme_support( 'wc-product-gallery-slider' );
 register_nav_menus( array( 'primary' => __( 'Hauptnavigation', 'forme' ), 'footer' => __( 'Service & Rechtliches', 'forme' ) ) );
}
add_action( 'after_setup_theme', 'forme_setup' );
function forme_assets() {
 wp_enqueue_style( 'forme', get_stylesheet_uri(), array(), '2.2.0' );
 wp_enqueue_style( 'forme-store', get_template_directory_uri() . '/assets/store.css', array( 'forme' ), '2.2.0' );
 wp_enqueue_script( 'forme-store', get_template_directory_uri() . '/assets/store.js', array(), '2.2.0', true );
 if ( class_exists( 'WC_AJAX' ) ) { wp_localize_script( 'forme-store', 'candyDelivery', array( 'url' => WC_AJAX::get_endpoint( 'candy_delivery' ), 'nonce' => wp_create_nonce( 'candy_delivery' ) ) ); }
}
add_action( 'wp_enqueue_scripts', 'forme_assets' );
function forme_shop_url() { return function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ); }
function forme_category_url( $slug ) {
 $term = get_term_by( 'slug', $slug, 'product_cat' );
 if ( $term ) { $url = get_term_link( $term ); if ( ! is_wp_error( $url ) ) { return $url; } }
 return forme_shop_url();
}
function forme_icon( $name, $size = 20 ) {
 $paths = array( 'arrow' => '<path d="M7 17 17 7M7 7h10v10"/>', 'bag' => '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', 'search' => '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>', 'user' => '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', 'menu' => '<path d="M4 6h16M4 12h16M4 18h16"/>' );
 $path = isset( $paths[$name] ) ? $paths[$name] : $paths['arrow'];
 return '<svg width="' . absint( $size ) . '" height="' . absint( $size ) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' . $path . '</svg>';
}
function forme_logo() {
 if ( has_custom_logo() ) { the_custom_logo(); } else { echo '<a class="brand" href="' . esc_url( home_url( '/' ) ) . '" aria-label="Candy Corner – Startseite"><img src="' . esc_url( get_template_directory_uri() . '/assets/logo.png' ) . '" alt="Candy Corner" width="1536" height="1024"></a>'; }
}
function forme_fallback_menu() {
 echo '<ul class="nav-menu">';
 foreach ( array( '' => 'Unser Sortiment', 'suessigkeiten' => 'Süßigkeiten', 'snacks' => 'Snacks', 'drinks' => 'Drinks' ) as $slug => $name ) { echo '<li><a href="' . esc_url( $slug ? forme_category_url( $slug ) : forme_shop_url() ) . '">' . esc_html( $name ) . '</a></li>'; }
 echo '</ul>';
}
function forme_content_wrapper_start() { echo '<main id="main" class="commerce-wrap section-wrap">'; }
function forme_content_wrapper_end() { echo '</main>'; }
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
add_action( 'woocommerce_before_main_content', 'forme_content_wrapper_start', 10 );
add_action( 'woocommerce_after_main_content', 'forme_content_wrapper_end', 10 );
add_filter( 'loop_shop_columns', function() { return 4; } );
function forme_cart_link() {
 $count = function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
 $url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : forme_shop_url();
 return '<a class="icon-button bag-button forme-cart-link" href="' . esc_url( $url ) . '" aria-label="' . esc_attr( sprintf( __( 'Warenkorb: %d Artikel', 'forme' ), $count ) ) . '">' . forme_icon( 'bag' ) . '<span class="bag-label desktop-label">' . esc_html__( 'Warenkorb', 'forme' ) . '</span><b class="bag-count">' . absint( $count ) . '</b></a>';
}
add_filter( 'woocommerce_add_to_cart_fragments', function( $fragments ) { $fragments['a.forme-cart-link'] = forme_cart_link(); return $fragments; } );
add_filter( 'woocommerce_product_get_image', function( $image, $product, $size, $attr, $placeholder ) {
 $position = $product->get_meta( '_candy_demo_position' );
 if ( ! $position && $product->get_parent_id() ) { $parent = wc_get_product( $product->get_parent_id() ); $position = $parent ? $parent->get_meta( '_candy_demo_position' ) : ''; }
 $allowed = array( '0% 0%', '100% 0%', '0% 100%', '100% 100%' );
 if ( ! $product->get_image_id() && in_array( $position, $allowed, true ) ) {
  return '<div role="img" aria-label="' . esc_attr( $product->get_name() ) . ' – KI-Beispielbild" class="product-image" style="background-image:url(' . esc_url( get_template_directory_uri() . '/assets/products.png' ) . ');background-position:' . esc_attr( $position ) . '"></div>';
 }
 return $image;
}, 10, 5 );
add_action( 'woocommerce_before_single_product_summary', function() {
 global $product;
 if ( $product && ! $product->get_image_id() && in_array( $product->get_meta( '_candy_demo_position' ), array( '0% 0%', '100% 0%', '0% 100%', '100% 100%' ), true ) ) {
  remove_action( 'woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20 );
  echo '<div class="woocommerce-product-gallery forme-demo-gallery">' . $product->get_image() . '</div>'; // Safe WooCommerce-generated image markup.
 }
}, 19 );
function forme_customize_register( $customizer ) {
 $customizer->add_section( 'forme_home', array( 'title' => 'Candy Corner Startseite', 'priority' => 30 ) );
 $fields = array(
  'announcement' => array( 'Ankündigung', 'DEIN CANDY-SPOT IN ESSEN' ),
  'hero_eyebrow' => array( 'Kampagnenzeile', 'GOOD MOOD. GREAT CANDY.' ),
  'hero_title' => array( 'Hauptüberschrift', "Dein Leben.\nEin bisschen süßer." ),
  'hero_copy' => array( 'Einleitung', 'Süß, sauer, crunchy. Entdecke deinen nächsten Lieblingssnack – für die Couch, die Crew und einfach so.' ),
  'hero_cta' => array( 'Button-Text', 'Entdecke deine Lieblinge' ),
  'editorial_title' => array( 'Banner-Überschrift', "Couch. Crew.\nCandy Corner." ),
  'editorial_copy' => array( 'Banner-Text', 'Lieblingsserie an. Lieblingssnacks dazu. Stell dir deinen ganz eigenen Sweet Mix zusammen.' ),
 );
 foreach ( $fields as $key => $field ) {
  $customizer->add_setting( 'forme_' . $key, array( 'default' => $field[1], 'sanitize_callback' => 'sanitize_textarea_field', 'transport' => 'refresh' ) );
  $customizer->add_control( 'forme_' . $key, array( 'label' => $field[0], 'section' => 'forme_home', 'type' => 'textarea' ) );
 }
 foreach ( array( 'hero_image' => 'Kampagnenbild' ) as $key => $label ) {
  $customizer->add_setting( 'forme_' . $key, array( 'sanitize_callback' => 'esc_url_raw' ) );
  $customizer->add_control( new WP_Customize_Image_Control( $customizer, 'forme_' . $key, array( 'label' => $label, 'section' => 'forme_home' ) ) );
 }
}
add_action( 'customize_register', 'forme_customize_register' );
require get_template_directory() . '/inc-delivery.php';
require get_template_directory() . '/inc-setup.php';

require get_template_directory() . '/inc-business.php';
require get_template_directory() . '/inc-age-notice.php';

require get_template_directory() . '/inc-legal.php';
require get_template_directory() . '/inc-withdrawal.php';
