# syntax=docker/dockerfile:1
ARG WORDPRESS_IMAGE=wordpress:7.1.1-php8.3-apache
ARG WPCLI_IMAGE=wordpress:cli-2.12.0-php8.3

FROM ${WPCLI_IMAGE} AS wpcli
FROM ${WORDPRESS_IMAGE}

ARG WOOCOMMERCE_VERSION=11.1.1
ARG WOOCOMMERCE_SHA256=c5748c60a28c5d4b439109def3955c5a629f7cd66b919ae5aefa588bcaace710

# The official WordPress image supplies Apache, PHP, mysqli, intl and ZipArchive.
COPY --from=wpcli /usr/local/bin/wp /usr/local/bin/wp
RUN set -eu; \
    curl --fail --show-error --location --retry 3 \
      "https://downloads.wordpress.org/plugin/woocommerce.${WOOCOMMERCE_VERSION}.zip" \
      --output /tmp/woocommerce.zip; \
    printf '%s  %s\n' "$WOOCOMMERCE_SHA256" /tmp/woocommerce.zip | sha256sum --check --strict -; \
    php -r '$zip = new ZipArchive(); if ($zip->open("/tmp/woocommerce.zip") !== true || !$zip->extractTo("/usr/src/wordpress/wp-content/plugins")) { exit(1); } $zip->close();'; \
    chown -R www-data:www-data /usr/src/wordpress/wp-content/plugins/woocommerce; \
    rm /tmp/woocommerce.zip

COPY --chown=www-data:www-data wordpress/forme/ /usr/src/wordpress/wp-content/themes/forme/
COPY docker/wordpress.ini /usr/local/etc/php/conf.d/forme.ini
COPY --chmod=0755 docker/setup-wordpress.sh /usr/local/bin/forme-setup

WORKDIR /var/www/html
# Keep the official entrypoint: it initializes the persistent WordPress volume.
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=10 \
  CMD curl --fail --silent --output /dev/null http://127.0.0.1/wp-login.php || exit 1
