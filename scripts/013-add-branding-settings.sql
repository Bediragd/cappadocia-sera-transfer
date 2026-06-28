-- Logo ve favicon yollari (admin panelden yuklenir)
INSERT INTO settings (key, value, description) VALUES
  ('site_logo', '/logo.png', 'Site logosu'),
  ('site_favicon', '/logo.png', 'Favicon (32x32)')
ON CONFLICT (key) DO NOTHING;
