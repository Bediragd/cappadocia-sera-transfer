-- Sofor basvuru formu ek alanlari
ALTER TABLE driver_applications ADD COLUMN IF NOT EXISTS tc_kimlik VARCHAR(11);
ALTER TABLE driver_applications ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR(20);
ALTER TABLE driver_applications ADD COLUMN IF NOT EXISTS vehicle_brand VARCHAR(100);
ALTER TABLE driver_applications ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100);
ALTER TABLE driver_applications ADD COLUMN IF NOT EXISTS vehicle_year VARCHAR(4);
ALTER TABLE driver_applications ADD COLUMN IF NOT EXISTS documents TEXT;
