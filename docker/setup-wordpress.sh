#!/bin/sh
# Idempotent first-time initialization; never reset an existing admin password.
set -eu
wp_cli() { wp --path=/var/www/html "$@"; }

: "${SITE_URL:?SITE_URL fehlt}"
case "$SITE_URL" in
  http://*|https://*) ;;
  *) printf '%s\n' 'SITE_URL muss mit http:// oder https:// beginnen.' >&2; exit 1 ;;
esac

if ! wp_cli core is-installed >/dev/null 2>&1; then
  : "${WP_ADMIN_USER:?WP_ADMIN_USER fehlt}"
  : "${WP_ADMIN_PASSWORD:?WP_ADMIN_PASSWORD fehlt}"
  : "${WP_ADMIN_EMAIL:?WP_ADMIN_EMAIL fehlt}"
  if [ "${#WP_ADMIN_PASSWORD}" -lt 16 ]; then
    printf '%s\n' 'WP_ADMIN_PASSWORD muss mindestens 16 Zeichen haben; docker/create-env.sh erzeugt ein zufälliges Passwort.' >&2
    exit 1
  fi
  printf '%s\n' 'Installiere WordPress ...'
  # --prompt reads the password from stdin so it is not in process arguments.
  printf '%s\n' "$WP_ADMIN_PASSWORD" | wp_cli core install \
    --url="$SITE_URL" \
    --title="${WP_TITLE:-Candy Corner}" \
    --admin_user="$WP_ADMIN_USER" \
    --admin_email="$WP_ADMIN_EMAIL" \
    --skip-email \
    --prompt=admin_password
fi

if [ "$(wp_cli option get forme_docker_setup_complete 2>/dev/null || true)" = '1' ]; then
  printf '%s\n' 'Candy Corner ist bereits eingerichtet. Benutzer und Shop-Einstellungen bleiben erhalten.'
  exit 0
fi

# Language downloads need internet. The shop can still start if translation
# servers are temporarily unavailable; retry the commands in docker/README.md.
if ! wp_cli language core install de_DE --activate; then
  printf '%s\n' 'Hinweis: Deutsche WordPress-Übersetzung konnte nicht geladen werden.' >&2
fi
if ! wp_cli language plugin install woocommerce de_DE; then
  printf '%s\n' 'Hinweis: Deutsche WooCommerce-Übersetzung konnte nicht geladen werden.' >&2
fi

wp_cli plugin activate woocommerce
wp_cli theme activate forme
wp_cli eval 'if (!class_exists("WC_Install")) { throw new RuntimeException("WooCommerce fehlt"); } WC_Install::create_pages();'
wp_cli option update timezone_string Europe/Berlin
wp_cli option update woocommerce_currency EUR
wp_cli option update woocommerce_default_country DE
wp_cli option update woocommerce_currency_pos right_space
wp_cli option update woocommerce_price_decimal_sep ','
wp_cli option update woocommerce_price_thousand_sep '.'
wp_cli rewrite structure '/%postname%/' --hard

wp_cli option update forme_docker_setup_complete 1
printf 'Candy Corner ist eingerichtet: %s/wp-admin/\n' "${SITE_URL%/}"
