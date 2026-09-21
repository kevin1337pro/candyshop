#!/bin/sh
# Generate secrets without printing them or overwriting an existing .env.
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_dir"
if [ -e .env ]; then
  printf '%s\n' '.env existiert bereits und wurde nicht verändert.' >&2
  exit 1
fi
command -v openssl >/dev/null 2>&1 || { printf '%s\n' 'openssl fehlt. Alternativ .env.example kopieren und sichere Passwörter eintragen.' >&2; exit 1; }
umask 077
temp_env=$(mktemp .env.generated.XXXXXX)
trap 'rm -f "$temp_env"' EXIT HUP INT TERM
password_db=$(openssl rand -hex 24)
password_root=$(openssl rand -hex 24)
password_admin=$(openssl rand -hex 24)
sed \
  -e "s/^DB_PASSWORD=$/DB_PASSWORD=$password_db/" \
  -e "s/^DB_ROOT_PASSWORD=$/DB_ROOT_PASSWORD=$password_root/" \
  -e "s/^WP_ADMIN_PASSWORD=$/WP_ADMIN_PASSWORD=$password_admin/" \
  .env.example > "$temp_env"
# Hard-link creation fails if another process created .env in the meantime.
ln "$temp_env" .env
printf '%s\n' '.env mit drei zufälligen Passwörtern erstellt (Dateirechte 600).' \
  'Jetzt WP_ADMIN_EMAIL und SITE_URL in .env eintragen; für HTTPS außerdem SHOP_DOMAIN.' \
  'Das erste Admin-Passwort steht in WP_ADMIN_PASSWORD. .env nicht weitergeben oder committen.'
