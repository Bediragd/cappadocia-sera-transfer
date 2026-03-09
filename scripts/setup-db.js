/**
 * Tam veritabanı kurulumu. Sırayla çalıştırır:
 * 001 → users, vehicles, airports, bookings, drivers, contact_messages, settings, sessions
 * 002 → popular_hotels
 * 003 → driver_applications
 * 004 → ek araçlar (kapasite)
 * 005 → araç description sütunları
 * Eksik tablo kalırsa: node scripts/setup-missing-tables.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('❌ HATA: DATABASE_URL bulunamadı!');
    console.log('\n📝 .env dosyanıza şunu ekleyin:');
    console.log('DATABASE_URL=your_neon_connection_string_here\n');
    process.exit(1);
  }

  console.log('🚀 Veritabanı kurulumu başlıyor...\n');

  try {
    const rawUrl = process.env.DATABASE_URL;
    const isLocal = /localhost|127\.0\.0\.1/.test(rawUrl);
    let connectionString = rawUrl;
    if (!isLocal) {
      connectionString = rawUrl
        .replace(/[?&]channel_binding=require/gi, '')
        .replace(/[?&]channel_binding=disable/gi, '');
      const sep = connectionString.includes('?') ? '&' : '?';
      if (!/[?&]sslmode=/i.test(connectionString)) connectionString += sep + 'sslmode=require';
      if (!/[?&]uselibpqcompat=true/i.test(connectionString)) connectionString += sep + 'uselibpqcompat=true';
      connectionString += (connectionString.includes('?') ? '&' : '?') + 'channel_binding=disable';
    }
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: isLocal ? 5000 : 30000,
    });

    console.log('🔌 Veritabanına bağlanılıyor...');
    await pool.query('SELECT 1');
    console.log('   Bağlantı OK.\n');

    await pool.query('SET statement_timeout = 90000');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '001-create-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL dosyası okundu: 001-create-tables.sql');
    console.log('⚙️  Tablolar oluşturuluyor...\n');

    // Execute SQL (tek seferde; takılırsa 60 sn sonra timeout)
    await pool.query(sqlContent);

    console.log('✅ Tüm tablolar başarıyla oluşturuldu!');
    console.log('\n📊 Oluşturulan tablolar:');
    console.log('   • users (Admin kullanıcıları)');
    console.log('   • vehicles (Araçlar)');
    console.log('   • airports (Havalimanları)');
    console.log('   • bookings (Rezervasyonlar)');
    console.log('   • drivers (Sürücüler)');
    console.log('   • contact_messages (İletişim mesajları)');
    console.log('   • settings (Site ayarları)');
    console.log('   • sessions (Oturum yönetimi)');
    // Oteller tablosu (rezervasyon formu otel listesi için)
    try {
      const sql002 = fs.readFileSync(path.join(__dirname, '002-create-hotels-table.sql'), 'utf8');
      await pool.query(sql002);
      console.log('   • popular_hotels (Popüler oteller)');
    } catch (e) {
      console.log('   ⚠️  002-create-hotels-table.sql atlandı:', e.message);
    }
    try {
      const sql003 = fs.readFileSync(path.join(__dirname, '003-create-driver-applications-table.sql'), 'utf8');
      await pool.query(sql003);
      console.log('   • driver_applications (Şoför başvuruları)');
    } catch (e) {
      console.log('   ⚠️  003-create-driver-applications-table.sql atlandı:', e.message);
    }
    console.log('\n📦 Varsayılan veriler ve ek tablolar:');
    console.log('   • 3 araç (Sedan, VIP Minivan, Minibüs)');
    console.log('   • 2 havalimanı (Nevşehir, Kayseri)');
    console.log('   • Site ayarları');

    // 9+1, 10+1, 11+1, 12+1 kapasiteli araçları ekle
    try {
      const sql004 = fs.readFileSync(path.join(__dirname, '004-add-capacity-vehicles.sql'), 'utf8');
      await pool.query(sql004);
      console.log('   • 4 kapasite aracı (9+1, 10+1, 11+1, 12+1)');
    } catch (e) {
      console.log('   ⚠️  004-add-capacity-vehicles.sql atlandı:', e.message);
    }

    // Araç description sütunları (admin paneli araç ekleme için)
    try {
      const sql005 = fs.readFileSync(path.join(__dirname, '005-add-vehicle-description-columns.sql'), 'utf8');
      await pool.query(sql005);
      console.log('   • Araç description sütunları (varsa) eklendi');
    } catch (e) {
      console.log('   ⚠️  005-add-vehicle-description-columns.sql atlandı:', e.message);
    }
    
    // Soru & Cevap (Q&A) tablosu
    try {
      const sql006 = fs.readFileSync(path.join(__dirname, '006-create-qa-table.sql'), 'utf8');
      await pool.query(sql006);
      console.log('   • qa_questions (Soru & Cevap) tablosu');
    } catch (e) {
      console.log('   ⚠️  006-create-qa-table.sql atlandı:', e.message);
    }
    
    // Create test admin user
    const crypto = require('crypto');
    const testPassword = 'admin123';
    const passwordHash = crypto.createHash('sha256').update(testPassword).digest('hex');
    
    const adminHash = crypto.createHash('sha256').update('Admin123!').digest('hex');
    try {
      await pool.query(`
        INSERT INTO users (email, password_hash, name, role)
        VALUES 
          ('admin@example.com', '${passwordHash}', 'Admin', 'admin'),
          ('akbudakramazannazmi@gmail.com', '${adminHash}', 'Admin', 'admin')
        ON CONFLICT (email) DO NOTHING
      `);
      console.log('\n👤 Admin kullanıcıları:');
      console.log('   • Email: akbudakramazannazmi@gmail.com  Şifre: Admin123!');
      console.log('   • Email: admin@example.com  Şifre: admin123');
    } catch (error) {
      console.log('\n⚠️  Admin kullanıcısı zaten mevcut veya oluşturulamadı');
    }
    
    console.log('\n🎉 Kurulum tamamlandı! Şimdi uygulamayı çalıştırabilirsiniz:');
    console.log('   pnpm dev\n');

    await pool.end();

  } catch (error) {
    console.error('❌ HATA:', error.message);
    console.error('\n💡 Kontrol edin:');
    console.error('   1. DATABASE_URL doğru mu?');
    console.error('   2. Neon.tech üzerinde veritabanı oluşturuldu mu?');
    console.error('   3. İnternet bağlantınız var mı?\n');
    process.exit(1);
  }
}

setupDatabase();
