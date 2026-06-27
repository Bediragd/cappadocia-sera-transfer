-- Ek site ayarları (genel, dil, bildirim, ödeme)
INSERT INTO settings (key, value, description) VALUES
  ('company_name', 'Cappadocia Sera Transfer', 'Şirket adı'),
  ('site_address', 'Nevsehir, Turkiye', 'Adres'),
  ('site_phone', '0553 464 71 50', 'Telefon'),
  ('site_email', 'info@cappadociaseratransfer.com', 'E-posta'),
  ('site_whatsapp', '905534647150', 'WhatsApp numarası'),
  ('enabled_locales', '["tr","en","ru","hi"]', 'Aktif diller (JSON)'),
  ('notify_booking', 'true', 'Yeni rezervasyon bildirimi'),
  ('notify_driver_application', 'true', 'Şoför başvuru bildirimi'),
  ('notify_contact', 'true', 'İletişim formu bildirimi'),
  ('payment_cash_enabled', 'true', 'Nakit / transfer ödemesi'),
  ('payment_online_enabled', 'false', 'Online ödeme'),
  ('social_instagram', 'https://instagram.com', 'Instagram bağlantısı'),
  ('social_facebook', 'https://facebook.com', 'Facebook bağlantısı'),
  ('social_youtube', '', 'YouTube bağlantısı'),
  ('social_twitter', '', 'Twitter/X bağlantısı')
ON CONFLICT (key) DO NOTHING;
