-- Nevşehir Transfer Database Schema

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  capacity INTEGER NOT NULL,
  luggage_capacity INTEGER NOT NULL,
  features_tr TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  features_ru TEXT[] DEFAULT '{}',
  features_hi TEXT[] DEFAULT '{}',
  price_per_km DECIMAL(10, 2) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Airports table
CREATE TABLE IF NOT EXISTS airports (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  
  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_passport VARCHAR(100),
  
  -- Transfer details
  transfer_type VARCHAR(50) NOT NULL CHECK (transfer_type IN ('airport_to_hotel', 'hotel_to_airport')),
  airport_id INTEGER REFERENCES airports(id),
  hotel_address TEXT NOT NULL,
  
  -- Vehicle and pricing
  vehicle_id INTEGER REFERENCES vehicles(id),
  passenger_count INTEGER NOT NULL,
  distance_km DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER,
  calculated_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2),
  
  -- Schedule
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  flight_number VARCHAR(50),
  
  -- Additional
  notes TEXT,
  driver_id INTEGER,
  
  -- Payment (for future)
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Metadata
  language VARCHAR(10) DEFAULT 'tr',
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  
  -- Personal info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  birth_date DATE,
  address TEXT,
  city VARCHAR(100),
  
  -- Documents
  license_number VARCHAR(100),
  license_expiry DATE,
  id_number VARCHAR(50),
  
  -- Vehicle info
  own_vehicle BOOLEAN DEFAULT false,
  vehicle_type VARCHAR(100),
  vehicle_plate VARCHAR(50),
  
  -- Experience
  experience_years INTEGER,
  languages TEXT[] DEFAULT '{}',
  
  -- Documents URLs
  license_photo_url VARCHAR(500),
  id_photo_url VARCHAR(500),
  photo_url VARCHAR(500),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table for site configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description VARCHAR(500),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for admin authentication
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default vehicles
INSERT INTO vehicles (slug, name_tr, name_en, name_ru, name_hi, model, image_url, capacity, luggage_capacity, features_tr, features_en, features_ru, features_hi, price_per_km, base_price) VALUES
('sedan', 'Sedan', 'Sedan', 'Седан', 'सेडान', 'Mercedes E-Class', '/black-mercedes-e-class-sedan-luxury-car.jpg', 3, 2, 
  ARRAY['Klima', 'Wi-Fi', 'Şarj Soketi', 'Deri Koltuk'],
  ARRAY['Air Conditioning', 'Wi-Fi', 'Charging Port', 'Leather Seats'],
  ARRAY['Кондиционер', 'Wi-Fi', 'Зарядный порт', 'Кожаные сиденья'],
  ARRAY['एयर कंडीशनिंग', 'वाई-फाई', 'चार्जिंग पोर्ट', 'लेदर सीट'],
  12.00, 200.00),
('vip', 'VIP Minivan', 'VIP Minivan', 'VIP Минивэн', 'VIP मिनीवैन', 'Mercedes Vito VIP', '/black-mercedes-vito-vip-minivan-luxury.jpg', 6, 6,
  ARRAY['Klima', 'Wi-Fi', 'Şarj Soketi', 'TV Ekran', 'Minibar'],
  ARRAY['Air Conditioning', 'Wi-Fi', 'Charging Port', 'TV Screen', 'Minibar'],
  ARRAY['Кондиционер', 'Wi-Fi', 'Зарядный порт', 'ТВ экран', 'Минибар'],
  ARRAY['एयर कंडीशनिंग', 'वाई-फाई', 'चार्जिंग पोर्ट', 'टीवी स्क्रीन', 'मिनीबार'],
  18.00, 300.00),
('minibus', 'Minibüs', 'Minibus', 'Микроавтобус', 'मिनीबस', 'Mercedes Sprinter', '/white-mercedes-sprinter-minibus-passenger-van.jpg', 12, 12,
  ARRAY['Klima', 'Wi-Fi', 'Geniş Bagaj', 'USB Şarj'],
  ARRAY['Air Conditioning', 'Wi-Fi', 'Large Luggage', 'USB Charging'],
  ARRAY['Кондиционер', 'Wi-Fi', 'Большой багаж', 'USB зарядка'],
  ARRAY['एयर कंडीशनिंग', 'वाई-फाई', 'बड़ा सामान', 'USB चार्जिंग'],
  25.00, 400.00)
ON CONFLICT (slug) DO NOTHING;

-- Insert default airports
INSERT INTO airports (code, name_tr, name_en, name_ru, name_hi, latitude, longitude, address) VALUES
('NAV', 'Nevşehir Kapadokya Havalimanı', 'Nevsehir Cappadocia Airport', 'Аэропорт Невшехир Каппадокия', 'नेवशहीर कप्पाडोसिया हवाई अड्डा', 38.7719, 34.5347, 'Nevşehir Kapadokya Havalimanı, Tuzköy, Gülşehir, Nevşehir'),
('ASR', 'Kayseri Erkilet Havalimanı', 'Kayseri Erkilet Airport', 'Аэропорт Кайсери Эркилет', 'कैसेरी एर्किलेट हवाई अड्डा', 38.7739, 35.4956, 'Kayseri Erkilet Havalimanı, Kayseri')
ON CONFLICT (code) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('site_phone', '+90 500 123 45 67', 'Main contact phone number'),
('site_email', 'info@cappadociasera.com', 'Main contact email'),
('site_whatsapp', '+905001234567', 'WhatsApp number'),
('currency', 'TRY', 'Default currency'),
('min_booking_hours', '2', 'Minimum hours before booking')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
