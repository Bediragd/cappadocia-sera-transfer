#!/bin/sh
# Docker Compose Postgres — npm/node gerekmez.
# Kullanım: sh scripts/docker-migrate.sh
set -e

cd "$(dirname "$0")/.."

if ! docker compose ps db --status running -q 2>/dev/null | grep -q .; then
  echo "❌ db container çalışmıyor. Önce: docker compose up -d db"
  exit 1
fi

for f in scripts/001-create-tables.sql \
         scripts/002-create-hotels-table.sql \
         scripts/003-create-driver-applications-table.sql \
         scripts/004-add-capacity-vehicles.sql \
         scripts/005-add-vehicle-description-columns.sql \
         scripts/006-create-qa-table.sql \
         scripts/007-fix-qa-table.sql \
         scripts/008-seed-admin.sql \
         scripts/009-add-settings-keys.sql; do
  if [ ! -f "$f" ]; then
    echo "⏭️  Atlandı: $f"
    continue
  fi
  echo "✅ $f"
  docker compose exec -T db psql -U cappadocia -d cappadocia -v ON_ERROR_STOP=1 < "$f"
done

echo ""
echo "🎉 SQL migration tamamlandı."
echo "Admin kullanıcı için (isteğe bağlı): node scripts/setup-db.js"
