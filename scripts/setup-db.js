require('dotenv').config();
const { neon, Pool } = require('@neondatabase/serverless');
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
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, '001-create-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL dosyası okundu: 001-create-tables.sql');
    console.log('⚙️  Tablolar oluşturuluyor...\n');

    // Execute SQL
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
    console.log('\n📦 Varsayılan veriler eklendi:');
    console.log('   • 3 araç (Sedan, VIP Minivan, Minibüs)');
    console.log('   • 2 havalimanı (Nevşehir, Kayseri)');
    console.log('   • Site ayarları');
    
    // Create test admin user
    const crypto = require('crypto');
    const testPassword = 'admin123';
    const passwordHash = crypto.createHash('sha256').update(testPassword).digest('hex');
    
    try {
      await pool.query(`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ('admin@example.com', '${passwordHash}', 'Admin', 'admin')
        ON CONFLICT (email) DO NOTHING
      `);
      console.log('\n👤 Test admin kullanıcısı oluşturuldu:');
      console.log('   Email: admin@example.com');
      console.log('   Şifre: admin123');
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
