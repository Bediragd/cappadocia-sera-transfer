/**
 * Sadece popular_hotels tablosunu oluşturur ve örnek otelleri ekler.
 * Sunucuda bir kez çalıştır: node scripts/setup-hotels.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL gerekli (.env)');
    process.exit(1);
  }
  const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '002-create-hotels-table.sql'), 'utf8');
    await pool.query(sql);
    console.log('popular_hotels tablosu ve otel verileri oluşturuldu.');
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
