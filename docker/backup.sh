#!/bin/sh
# Run from the checkout used for the active Compose project.
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_dir"
umask 077
backup_dir="backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p backups
mkdir "$backup_dir"
was_running=0
if [ -n "$(docker compose ps --status running -q wordpress)" ]; then
  was_running=1
fi
resume_wordpress() {
  if [ "$was_running" = 1 ]; then
    docker compose start wordpress >&2
  fi
}
trap resume_wordpress EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker compose stop wordpress
docker compose exec -T db sh -c \
  'exec mariadb-dump --single-transaction --quick --skip-lock-tables -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' \
  > "$backup_dir/database.sql.partial"
mv "$backup_dir/database.sql.partial" "$backup_dir/database.sql"
docker compose run --rm --no-deps -T --user 0 --entrypoint tar wpcli \
  --exclude=./wp-content/themes/forme -czf - -C /var/www/html . \
  > "$backup_dir/wordpress.tar.gz.partial"
mv "$backup_dir/wordpress.tar.gz.partial" "$backup_dir/wordpress.tar.gz"
printf 'Backup gespeichert: %s\n' "$backup_dir"
