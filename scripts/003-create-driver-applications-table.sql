-- Şoför başvuruları (formdan gelen talepler; onaylananlar ayrıca drivers'a eklenebilir)
CREATE TABLE IF NOT EXISTS driver_applications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  license_type VARCHAR(100) NOT NULL,
  has_own_vehicle BOOLEAN NOT NULL DEFAULT false,
  vehicle_type VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_applications_status ON driver_applications(status);
CREATE INDEX IF NOT EXISTS idx_driver_applications_created ON driver_applications(created_at DESC);
