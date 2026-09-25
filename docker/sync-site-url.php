<?php
// Run through WP-CLI after taking a backup, never as a web endpoint.
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) { exit( 1 ); }
if ( is_multisite() || '1' === getenv( 'CANDY_MULTISITE' ) ) {
 WP_CLI::log( 'Multisite: Domain-Zuordnungen bleiben unverändert.' );
 return;
}
$url = rtrim( (string) getenv( 'SITE_URL' ), '/' );
$parts = wp_parse_url( $url );
if ( ! $parts || empty( $parts['host'] ) || ! in_array( $parts['scheme'] ?? '', array( 'http', 'https' ), true ) || ( isset( $parts['user'] ) || isset( $parts['pass'] ) ) || isset( $parts['query'] ) || isset( $parts['fragment'] ) ) {
 WP_CLI::error( 'SITE_URL muss eine vollständige, öffentliche Shop-URL sein.' );
}
$local = in_array( $parts['host'], array( 'localhost', '127.0.0.1', '[::1]' ), true );
if ( ! $local && ( 'https' !== $parts['scheme'] || ( isset( $parts['port'] ) && 443 !== $parts['port'] ) ) ) {
 WP_CLI::error( 'Für öffentliche Domains HTTPS ohne internen Port (z. B. :8080) verwenden.' );
}
// WP_HOME/WP_SITEURL filter get_option(). Updating through update_option() can
// therefore be a no-op while stale URLs remain in the database.
global $wpdb;
foreach ( array( 'home', 'siteurl' ) as $name ) {
 $result = $wpdb->update( $wpdb->options, array( 'option_value' => $url ), array( 'option_name' => $name ), array( '%s' ), array( '%s' ) );
 if ( false === $result ) { WP_CLI::error( 'Shop-URL konnte nicht gespeichert werden.' ); }
 wp_cache_delete( $name, 'options' );
}
wp_cache_delete( 'alloptions', 'options' );
WP_CLI::success( 'Öffentliche WordPress-Adresse: ' . $url );
