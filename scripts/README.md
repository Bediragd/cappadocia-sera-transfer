# Veritabanı scriptleri

## Tablo – script eşlemesi

| Tablo | Script | Açıklama |
|-------|--------|----------|
| users | 001 | Admin kullanıcıları |
| vehicles | 001, 004, 005 | Araçlar + kapasite + description |
| airports | 001 | Havalimanları |
| bookings | 001 | Rezervasyonlar |
| drivers | 001 | Sürücüler |
| contact_messages | 001 | İletişim mesajları |
| settings | 001 | Site ayarları |
| sessions | 001 | Oturumlar |
| popular_hotels | 002 | Popüler oteller (rezervasyon formu) |
| driver_applications | 003 | Şoför başvuruları |

## Komutlar

- **İlk kurulum:** `pnpm setup-db` veya `node scripts/setup-db.js`
- **Sadece eksik tablolar (002, 003):** `pnpm setup-missing-tables` veya `node scripts/setup-missing-tables.js`

Yeni bir tablo eklediğinizde: SQL dosyasını `scripts/` altına koyun ve `setup-db.js` içinde try/catch ile çalıştırın; isteğe bağlı olarak `setup-missing-tables.js` listesine ekleyin.
