-- Soru & Cevap bildirim ayari
INSERT INTO settings (key, value, description) VALUES
  ('notify_qa', 'true', 'Yeni soru bildirimi')
ON CONFLICT (key) DO NOTHING;
