#!/bin/sh
# Admin şifresini sıfırlar (Docker Postgres)
set -e
cd "$(dirname "$0")/.."
docker compose exec -T db psql -U cappadocia -d cappadocia -v ON_ERROR_STOP=1 < scripts/008-seed-admin.sql
echo "Admin şifresi sıfırlandı: akbudakramazannazmi@gmail.com / Admin123!"
