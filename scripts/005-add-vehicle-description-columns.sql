-- Admin paneli araç ekleme/düzenleme description alanları (API description_tr kullanıyor)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description_tr TEXT DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description_en TEXT DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description_ru TEXT DEFAULT '';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description_hi TEXT DEFAULT '';
