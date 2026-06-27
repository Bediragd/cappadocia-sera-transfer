-- SMTP ayarlari (admin panelden yonetilir)
INSERT INTO settings (key, value, description) VALUES
  ('smtp_host', 'smtp.gmail.com', 'SMTP sunucu adresi'),
  ('smtp_port', '587', 'SMTP port'),
  ('smtp_secure', 'false', 'SMTP SSL (465 icin true)'),
  ('smtp_pass', '', 'SMTP sifre / uygulama sifresi')
ON CONFLICT (key) DO NOTHING;
