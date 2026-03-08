/**
 * Sadece ek tabloları oluşturur (001'de olmayanlar).
 * Sunucuda bir kez veya eksik tablo hatası alındığında çalıştır: node scripts/setup-missing-tables.js
 * 001 zaten çalıştırıldıysa sadece popular_hotels ve driver_applications eklenir.
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const SCRIPTS = [
  '002-create-hotels-table.sql',
  '003-create-driver-applications-table.sql',
];

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
    for (const file of SCRIPTS) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.log('Atlandı (dosya yok):', file);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      await pool.query(sql);
      console.log('OK:', file);
    }
    console.log('Eksik tablolar oluşturuldu.');
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
