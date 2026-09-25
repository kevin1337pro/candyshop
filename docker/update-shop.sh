#!/bin/sh
# In-place update: preserve database, uploads, accounts and plugin settings.
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_dir"
[ -f .env ] || { printf '%s\n' '.env fehlt. Bestehende Serverkonfiguration verwenden.' >&2; exit 1; }
docker compose config --quiet
printf '%s\n' 'Sichere vorhandene Shopdaten vor dem Update ...'
sh docker/backup.sh
docker compose build --pull wordpress
docker compose up -d wordpress
# Run even if the one-shot setup container has already completed in the past.
docker compose run --rm setup
printf '%s\n' 'Update abgeschlossen. Proxy-Konfiguration laut docker/UPDATE-2026-09.md prüfen.'
