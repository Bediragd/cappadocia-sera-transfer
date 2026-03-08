/**
 * Sadece driver_applications tablosunu oluşturur.
 * Sunucuda bir kez çalıştır: node scripts/setup-driver-applications.js
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
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '003-create-driver-applications-table.sql'), 'utf8');
    await pool.query(sql);
    console.log('driver_applications tablosu oluşturuldu.');
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
