-- Admin kullanıcıları — varsa şifreyi de günceller (ON CONFLICT DO NOTHING sorunu giderildi)
-- akbudakramazannazmi@gmail.com → Admin123!
-- admin@example.com → admin123
INSERT INTO users (email, password_hash, name, role)
VALUES
  (
    'akbudakramazannazmi@gmail.com',
    '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
    'Admin',
    'admin'
  ),
  (
    'admin@example.com',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'Admin',
    'admin'
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();
