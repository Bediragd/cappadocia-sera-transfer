/**
 * Tüm SQL migration'ları sırayla çalıştırır (001 → 007).
 * Mevcut veritabanına güvenle tekrar çalıştırılabilir (IF NOT EXISTS / ON CONFLICT).
 *
 * Kullanım: pnpm migrate  veya  node scripts/migrate.js
 * Gerekli: .env içinde DATABASE_URL
 */
const { loadEnv } = require('./load-env');
loadEnv();
const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MIGRATIONS = [
  '001-create-tables.sql',
  '002-create-hotels-table.sql',
  '003-create-driver-applications-table.sql',
  '004-add-capacity-vehicles.sql',
  '005-add-vehicle-description-columns.sql',
  '006-create-qa-table.sql',
  '007-fix-qa-table.sql',
  '008-seed-admin.sql',
  '009-add-settings-keys.sql',
  '010-create-push-subscriptions.sql',
  '011-add-notify-qa-setting.sql',
  '012-add-smtp-settings.sql',
  '013-add-branding-settings.sql',
  '014-add-driver-application-fields.sql',
];

function buildConnectionString(rawUrl) {
  const isLocal = /localhost|127\.0\.0\.1/.test(rawUrl);
  if (isLocal) return rawUrl;

  let connectionString = rawUrl
    .replace(/[?&]channel_binding=require/gi, '')
    .replace(/[?&]channel_binding=disable/gi, '');

  const sep = connectionString.includes('?') ? '&' : '?';
  if (!/[?&]sslmode=/i.test(connectionString)) connectionString += sep + 'sslmode=require';
  if (!/[?&]uselibpqcompat=true/i.test(connectionString)) connectionString += `${connectionString.includes('?') ? '&' : '?'}uselibpqcompat=true`;
  connectionString += `${connectionString.includes('?') ? '&' : '?'}channel_binding=disable`;

  return connectionString;
}

/** Docker .env: @db:5432 — sadece container ağında çözülür; host'ta 127.0.0.1:5433 */
function hostDockerFallback(rawUrl) {
  if (/@db:5432\b/.test(rawUrl)) {
    return rawUrl.replace('@db:5432', '@127.0.0.1:5433');
  }
  return null;
}

function createPool(rawUrl) {
  const connectionString = buildConnectionString(rawUrl);
  const isLocal = /localhost|127\.0\.0\.1/.test(rawUrl);
  return new Pool({
    connectionString,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: isLocal ? 5000 : 30000,
  });
}

async function connectPool(rawUrl) {
  const pool = createPool(rawUrl);
  try {
    await pool.query('SELECT 1');
    return pool;
  } catch (error) {
    await pool.end();
    const fallback = hostDockerFallback(rawUrl);
    if (fallback && /ENOTFOUND|getaddrinfo/i.test(error.message)) {
      console.log('ℹ️  Host\'tan çalıştırılıyor: db → 127.0.0.1:5433 (docker-compose port)\n');
      const fallbackPool = createPool(fallback);
      await fallbackPool.query('SELECT 1');
      return fallbackPool;
    }
    throw error;
  }
}

async function seedAdminUsers(pool) {
  const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');
  const adminHash = crypto.createHash('sha256').update('Admin123!').digest('hex');

  await pool.query(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES
      ('admin@example.com', $1, 'Admin', 'admin'),
      ('akbudakramazannazmi@gmail.com', $2, 'Admin', 'admin')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      updated_at = NOW()
  `, [passwordHash, adminHash]);
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL bulunamadı (.env dosyasını kontrol edin)');
    process.exit(1);
  }

  console.log('🚀 Migration başlıyor...\n');

  let pool;
  try {
    pool = await connectPool(process.env.DATABASE_URL);
    console.log('🔌 Veritabanı bağlantısı OK\n');

    await pool.query('SET statement_timeout = 90000');

    for (const file of MIGRATIONS) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Atlandı (dosya yok): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      await pool.query(sql);
      console.log(`✅ ${file}`);
    }

    try {
      await seedAdminUsers(pool);
      console.log('✅ Admin kullanıcıları (varsa atlandı)');
    } catch (e) {
      console.log('⚠️  Admin seed atlandı:', e.message);
    }

    console.log('\n🎉 Migration tamamlandı.');
  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
}

migrate();
