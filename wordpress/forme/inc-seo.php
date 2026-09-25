<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

function candy_seo_settings() {
 return wp_parse_args( get_option( 'candy_corner_seo', array() ), array( 'phone' => '', 'email' => '', 'hours' => '', 'address_confirmed' => '', 'google' => '', 'bing' => '', 'profiles' => '' ) );
}
function candy_seo_sanitize( $input ) {
 $result = array();
 foreach ( array( 'phone', 'hours' ) as $key ) { $result[$key] = sanitize_textarea_field( $input[$key] ?? '' ); }
 $result['email'] = sanitize_email( $input['email'] ?? '' );
 $result['address_confirmed'] = ! empty( $input['address_confirmed'] ) ? 'yes' : '';
 foreach ( array( 'google', 'bing' ) as $key ) { $result[$key] = preg_replace( '/[^a-zA-Z0-9_\-]/', '', $input[$key] ?? '' ); }
 $urls = array();
 foreach ( preg_split( '/\s+/', trim( $input['profiles'] ?? '' ) ) as $url ) { $url = esc_url_raw( $url, array( 'https' ) ); if ( $url ) { $urls[] = $url; } }
 $result['profiles'] = implode( "\n", array_unique( $urls ) );
 return $result;
}
add_action( 'admin_init', function() { register_setting( 'candy_seo', 'candy_corner_seo', array( 'sanitize_callback' => 'candy_seo_sanitize' ) ); } );
add_action( 'admin_menu', function() { add_theme_page( 'Auffindbarkeit', 'Auffindbarkeit', 'manage_options', 'candy-seo', 'candy_seo_admin' ); } );
function candy_seo_admin() {
 if ( ! current_user_can( 'manage_options' ) ) { return; }
 $s = candy_seo_settings(); ?>
 <div class="wrap"><h1>Candy Corner – Auffindbarkeit</h1><p>Kontaktdaten und Zeiten erscheinen sichtbar auf der Startseite. Nur echte, geprüfte Angaben eintragen; keine Platzhalter.</p>
 <p>Die öffentliche Domain kommt aus der WordPress-Adresse / SITE_URL. Aktuell: <code><?php echo esc_html( home_url( '/' ) ); ?></code>. Die Suchmaschinen-Sichtbarkeit wird unter <a href="<?php echo esc_url( admin_url( 'options-reading.php' ) ); ?>">Einstellungen → Lesen</a> verwaltet.</p>
 <p>Die Geschäftsadresse stammt aus <strong>WooCommerce → Einstellungen → Allgemein → Adresse des Geschäfts</strong>. Die Abholadresse unter „Candy Corner Einrichtung“ separat auf denselben aktuellen Stand bringen. Erst mit bestätigter, vollständiger Essener Geschäftsadresse werden lokale Geschäftsdaten ausgegeben.</p>
 <form action="options.php" method="post"><?php settings_fields( 'candy_seo' ); ?><table class="form-table"><tbody>
 <?php foreach ( array( 'phone' => 'Öffentliche Telefonnummer', 'email' => 'Geschäftliche E-Mail', 'hours' => 'Öffnungs- / Lieferzeiten (Klartext)', 'profiles' => 'Offizielle Profil-URLs (HTTPS, eine pro Zeile)', 'google' => 'Google Search Console: Verifizierungscode', 'bing' => 'Bing Webmaster Tools: Verifizierungscode' ) as $key => $label ) : ?>
 <tr><th><label for="seo-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th><td><textarea rows="2" class="large-text" id="seo-<?php echo esc_attr( $key ); ?>" name="candy_corner_seo[<?php echo esc_attr( $key ); ?>]"><?php echo esc_textarea( $s[$key] ); ?></textarea></td></tr>
 <?php endforeach; ?>
 <tr><th>Geschäftsadresse</th><td><label><input type="checkbox" name="candy_corner_seo[address_confirmed]" value="yes" <?php checked( $s['address_confirmed'], 'yes' ); ?>> Die WooCommerce-Geschäftsadresse ist vollständig, echt und zur Veröffentlichung geprüft.</label></td></tr>
 </tbody></table><?php submit_button(); ?></form><p>Die Sitemap liegt unter <a href="<?php echo esc_url( home_url( '/wp-sitemap.xml' ) ); ?>">wp-sitemap.xml</a>. Ein zusätzlich installiertes SEO-Plugin übernimmt seine eigene Sitemap und Metadaten.</p></div>
 <?php
}
function candy_business_address() {
 $s = candy_seo_settings();
 $street = trim( get_option( 'woocommerce_store_address', '' ) . ' ' . get_option( 'woocommerce_store_address_2', '' ) );
 $zip = trim( get_option( 'woocommerce_store_postcode', '' ) ); $city = trim( get_option( 'woocommerce_store_city', '' ) );
 $country = explode( ':', get_option( 'woocommerce_default_country', '' ) )[0];
 if ( 'yes' !== $s['address_confirmed'] || ! $street || 'essen' !== strtolower( $city ) || 'DE' !== $country || ! in_array( $zip, candy_essen_postcodes(), true ) || false !== strpos( $street, '[[' ) ) { return array(); }
 return array( '@type' => 'PostalAddress', 'streetAddress' => $street, 'postalCode' => $zip, 'addressLocality' => $city, 'addressCountry' => $country );
}
function candy_local_info() {
 $s = candy_seo_settings(); $delivery = candy_settings(); $address = candy_business_address(); ?>
 <section class="local-info wrap" id="candy-in-essen" aria-labelledby="local-heading"><span class="eyebrow cyan">DEIN CANDY-SPOT VOR ORT</span><h2 id="local-heading">Süßigkeiten liefern lassen in Essen.</h2><dl>
 <div><dt>Persönliche Lieferung</dt><dd>Wir bringen Süßigkeiten, Snacks und Drinks mit dem Auto zu dir in Essen. Kein Paketversand. Prüfe vor deiner Bestellung <a href="#bestellen">deine Postleitzahl</a>.</dd></div>
 <div><dt>Bestellwert & Lieferkosten</dt><dd>Ab <?php echo wp_kses_post( candy_money( $delivery['minimum'] ) ); ?> Warenwert. Lieferung: <?php echo wp_kses_post( candy_money( $delivery['fee'] ) ); ?>. Abholung ohne Lieferkosten. Die verfügbaren Zahlungsarten stehen an der Kasse.</dd></div>
 <div><dt>Abholen bei Candy Corner</dt><dd><?php echo esc_html( $delivery['pickup_address'] ?: 'Essen-Zentrum – die genaue Abholadresse folgt zum Shopstart.' ); ?></dd></div>
 <?php if ( $address ) : ?><div><dt>Unser Geschäft</dt><dd><?php echo esc_html( $address['streetAddress'] . ', ' . $address['postalCode'] . ' ' . $address['addressLocality'] ); ?></dd></div><?php endif; ?>
 <?php if ( $s['hours'] ) : ?><div><dt>Öffnungs- & Lieferzeiten</dt><dd><?php echo nl2br( esc_html( $s['hours'] ) ); ?></dd></div><?php endif; ?>
 <?php if ( $s['phone'] || $s['email'] || $s['profiles'] ) : ?><div><dt>Kontakt & Profile</dt><dd><?php if ( $s['phone'] ) { echo '<a href="tel:' . esc_attr( preg_replace( '/[^0-9+]/', '', $s['phone'] ) ) . '">' . esc_html( $s['phone'] ) . '</a><br>'; } if ( $s['email'] ) { echo '<a href="mailto:' . esc_attr( $s['email'] ) . '">' . esc_html( $s['email'] ) . '</a><br>'; } foreach ( array_filter( explode( "\n", $s['profiles'] ) ) as $url ) { echo '<a href="' . esc_url( $url ) . '" rel="me">' . esc_html( wp_parse_url( $url, PHP_URL_HOST ) ) . '</a><br>'; } ?></dd></div><?php endif; ?>
 </dl></section><?php
}
function candy_has_seo_plugin() {
 return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}
function candy_demo_product( $id ) {
 return get_post_meta( $id, '_candy_demo_position', true ) && ! get_post_thumbnail_id( $id );
}
function candy_noindex_page() {
 if ( is_search() || is_404() || is_attachment() || is_author() || is_date() || ( is_singular() && post_password_required() ) ) { return true; }
 if ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) ) { return true; }
 if ( is_singular( 'product' ) && candy_demo_product( get_queried_object_id() ) ) { return true; }
 if ( is_page() && 'vertrag-widerrufen' === get_post_field( 'post_name', get_queried_object_id() ) ) { return true; }
 foreach ( array_keys( $_GET ) as $key ) {
  if ( in_array( $key, array( 'add-to-cart', 'wc-ajax', 'min_price', 'max_price', 'rating_filter', 'orderby', 'download_file', 'key' ), true ) || 0 === strpos( $key, 'filter_' ) || 0 === strpos( $key, 'query_type_' ) ) { return true; }
 }
 return false;
}
function candy_robots_policy( $robots ) {
 if ( candy_noindex_page() ) { unset( $robots['index'] ); $robots['noindex'] = true; }
 return $robots;
}
add_filter( 'wp_robots', 'candy_robots_policy', 99 );
// HTTP indexing control remains effective if another plugin replaces wp_robots.
add_action( 'template_redirect', function() {
 if ( candy_noindex_page() || '0' === (string) get_option( 'blog_public' ) ) { header( 'X-Robots-Tag: noindex', false ); }
}, 0 );
function candy_seo_url() {
 if ( is_front_page() ) { return home_url( '/' ); }
 if ( is_singular() ) { return wp_get_canonical_url(); }
 if ( function_exists( 'is_shop' ) && is_shop() ) { $url = get_permalink( wc_get_page_id( 'shop' ) ); }
 elseif ( is_category() || is_tag() || is_tax() ) { $url = get_term_link( get_queried_object() ); }
 elseif ( is_post_type_archive() ) { $url = get_post_type_archive_link( get_query_var( 'post_type' ) ); }
 elseif ( is_home() ) { $url = get_permalink( get_option( 'page_for_posts' ) ); }
 else { return ''; }
 if ( ! $url || is_wp_error( $url ) ) { return ''; }
 $page = max( 1, (int) get_query_var( 'paged' ) );
 if ( $page > 1 ) { return get_option( 'permalink_structure' ) ? trailingslashit( $url ) . user_trailingslashit( 'page/' . $page, 'paged' ) : add_query_arg( 'paged', $page, $url ); }
 return $url;
}
function candy_seo_description() {
 if ( is_front_page() || ( function_exists( 'is_shop' ) && is_shop() ) ) { return 'Süßigkeiten, Snacks und Drinks von Candy Corner: persönliche Lieferung in Essen oder Abholung vor Ort. Liefergebiet per PLZ prüfen und Lieblingssnacks auswählen.'; }
 if ( is_singular() ) { $post = get_queried_object(); $text = $post->post_excerpt ?: $post->post_content; }
 elseif ( is_category() || is_tag() || is_tax() ) { $text = term_description(); }
 else { return ''; }
 return wp_html_excerpt( trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( strip_shortcodes( $text ) ) ) ), 160, '…' );
}
add_filter( 'pre_get_document_title', function( $title ) {
 if ( candy_has_seo_plugin() ) { return $title; }
 if ( is_front_page() ) { return 'Candy Corner Essen – Süßigkeiten liefern lassen & abholen'; }
 return $title;
} );
add_action( 'wp', function() { if ( ! candy_has_seo_plugin() ) { remove_action( 'wp_head', 'rel_canonical' ); } } );
add_action( 'wp_head', function() {
 $s = candy_seo_settings();
 foreach ( array( 'google' => 'google-site-verification', 'bing' => 'msvalidate.01' ) as $key => $name ) { if ( $s[$key] ) { echo '<meta name="' . esc_attr( $name ) . '" content="' . esc_attr( $s[$key] ) . '">' . "\n"; } }
 if ( candy_has_seo_plugin() || candy_noindex_page() ) { return; }
 $url = candy_seo_url(); $description = candy_seo_description();
 if ( $url ) { echo '<link rel="canonical" href="' . esc_url( $url ) . '">' . "\n"; }
 if ( $description ) { echo '<meta name="description" content="' . esc_attr( $description ) . '">' . "\n"; }
 foreach ( array( 'og:type' => 'website', 'og:locale' => 'de_DE', 'og:site_name' => 'Candy Corner', 'og:title' => wp_get_document_title(), 'og:description' => $description, 'og:url' => $url ) as $key => $value ) { if ( $value ) { echo '<meta property="' . esc_attr( $key ) . '" content="' . esc_attr( $value ) . '">' . "\n"; } }
 if ( ! is_front_page() || '0' === (string) get_option( 'blog_public' ) ) { return; }
 $home = home_url( '/' ); $address = candy_business_address();
 $business = array( '@type' => $address ? 'Store' : 'Organization', '@id' => $home . '#business', 'name' => 'Candy Corner', 'url' => $home, 'logo' => get_template_directory_uri() . '/assets/candy-corner-logo.webp', 'areaServed' => array( '@type' => 'City', 'name' => 'Essen', 'containedInPlace' => array( '@type' => 'Country', 'name' => 'Deutschland' ) ) );
 if ( $address ) { $business['address'] = $address; $business['image'] = get_template_directory_uri() . '/assets/candy-corner-logo.webp'; }
 foreach ( array( 'phone' => 'telephone', 'email' => 'email' ) as $key => $property ) { if ( $s[$key] ) { $business[$property] = $s[$key]; } }
 if ( $s['profiles'] ) { $business['sameAs'] = array_values( array_filter( explode( "\n", $s['profiles'] ) ) ); }
 $graph = array( '@context' => 'https://schema.org', '@graph' => array( $business, array( '@type' => 'WebSite', '@id' => $home . '#website', 'url' => $home, 'name' => 'Candy Corner Essen', 'inLanguage' => 'de-DE', 'publisher' => array( '@id' => $home . '#business' ) ) ) );
 echo '<script type="application/ld+json">' . wp_json_encode( $graph, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}, 5 );
add_filter( 'woocommerce_structured_data_product', function( $data, $product ) { return candy_demo_product( $product->get_id() ) ? array() : $data; }, 20, 2 );

function candy_sitemap_exclusions() {
 $ids = array();
 if ( function_exists( 'wc_get_page_id' ) ) { foreach ( array( 'cart', 'checkout', 'myaccount' ) as $key ) { $id = wc_get_page_id( $key ); if ( $id > 0 ) { $ids[] = $id; } } }
 $withdrawal = get_page_by_path( 'vertrag-widerrufen' ); if ( $withdrawal ) { $ids[] = $withdrawal->ID; }
 $demo = get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'fields' => 'ids', 'posts_per_page' => -1, 'meta_query' => array( array( 'key' => '_candy_demo_position', 'compare' => 'EXISTS' ), array( 'relation' => 'OR', array( 'key' => '_thumbnail_id', 'compare' => 'NOT EXISTS' ), array( 'key' => '_thumbnail_id', 'value' => 0 ) ) ) ) );
 return array_merge( $ids, $demo );
}
add_filter( 'wp_sitemaps_add_provider', function( $provider, $name ) { return 'users' === $name ? false : $provider; }, 10, 2 );
add_filter( 'wp_sitemaps_posts_query_args', function( $args ) { $args['post__not_in'] = array_unique( array_merge( $args['post__not_in'] ?? array(), candy_sitemap_exclusions() ) ); $args['has_password'] = false; return $args; } );
