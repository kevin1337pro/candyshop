<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
/** Static responsive WebP variants need no image service at request time. */
function candy_asset_image( $name, $alt, $sizes, $attrs = array() ) {
 $widths = 'candy-hero' === $name ? array( 480, 768, 1152, 1536 ) : ( 'candy-corner-logo' === $name ? array( 192, 384, 768 ) : array( 240, 480, 627 ) );
 $max = end( $widths ); $base = get_template_directory_uri() . '/assets/'; $set = array();
 foreach ( $widths as $width ) { $set[] = $base . $name . ( $width === $max ? '' : '-' . $width ) . '.webp ' . $width . 'w'; }
 $height = in_array( $name, array( 'candy-hero', 'candy-corner-logo' ), true ) ? (int) ( $max * 2 / 3 ) : $max;
 $attrs = wp_parse_args( $attrs, array( 'loading' => 'lazy', 'decoding' => 'async' ) );
 $html = '<img src="' . esc_url( $base . $name . '.webp' ) . '" srcset="' . esc_attr( implode( ', ', $set ) ) . '" sizes="' . esc_attr( $sizes ) . '" width="' . $max . '" height="' . $height . '" alt="' . esc_attr( $alt ) . '"';
 foreach ( $attrs as $key => $value ) { if ( in_array( $key, array( 'loading', 'decoding', 'fetchpriority', 'class' ), true ) ) { $html .= ' ' . $key . '="' . esc_attr( $value ) . '"'; } }
 return $html . '>';
}
function candy_hero_image() {
 $custom = get_theme_mod( 'forme_hero_image', '' );
 $base = get_template_directory_uri() . '/assets/';
 if ( ! $custom || in_array( $custom, array( $base . 'hero.png', $base . 'candy-hero.webp' ), true ) ) {
  return candy_asset_image( 'candy-hero', 'Bunte Süßigkeiten in einer schwarzen Candy-Box', '(min-width: 1024px) 700px, (min-width: 768px) 55vw, calc(100vw - 32px)', array( 'loading' => 'eager', 'fetchpriority' => 'high' ) );
 }
 $id = attachment_url_to_postid( $custom );
 if ( $id ) { return wp_get_attachment_image( $id, 'full', false, array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); }
 return '<img src="' . esc_url( $custom ) . '" alt="Candy Corner – Süßigkeiten in Essen" width="1536" height="1024" loading="eager" fetchpriority="high" decoding="async">';
}
// Future uploads: retain the original, create WebP derivatives where supported.
add_filter( 'image_editor_output_format', function( $formats ) {
 if ( wp_image_editor_supports( array( 'mime_type' => 'image/webp' ) ) ) {
  $formats['image/jpeg'] = 'image/webp'; $formats['image/png'] = 'image/webp';
 }
 return $formats;
} );
