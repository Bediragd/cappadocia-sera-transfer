import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Types
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  role: 'admin' | 'staff'
  created_at: Date
  updated_at: Date
}

export interface Vehicle {
  id: number
  name: string
  name_tr: string
  name_en: string
  name_ru: string
  name_hi: string
  description_tr: string
  description_en: string
  description_ru: string
  description_hi: string
  capacity: number
  luggage_capacity: number
  image_url: string
  price_per_km: number
  base_price: number
  is_active: boolean
  created_at: Date
}

export interface Airport {
  id: number
  code: string
  name_tr: string
  name_en: string
  name_ru: string
  name_hi: string
  city_tr: string
  city_en: string
  city_ru: string
  city_hi: string
  distance_to_nevsehir: number
  is_active: boolean
}

export interface Booking {
  id: number
  booking_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_location: string
  dropoff_location: string
  pickup_date: Date
  pickup_time: string
  passengers: number
  luggage: number
  vehicle_id: number
  driver_id: number | null
  total_price: number
  currency: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method: string | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

export interface Driver {
  id: number
  name: string
  phone: string
  email: string
  license_number: string
  vehicle_id: number | null
  status: 'available' | 'busy' | 'offline'
  rating: number
  total_rides: number
  is_active: boolean
  created_at: Date
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: Date
}

export interface DriverApplication {
  id: number
  name: string
  email: string
  phone: string
  experience_years: number
  license_type: string
  has_own_vehicle: boolean
  vehicle_type: string | null
  city: string
  message: string | null
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: Date
}
