import { z } from 'zod'

export const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  dropoffLocation: z.string().min(1, 'Dropoff location is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  passengers: z.number().min(1, 'At least 1 passenger required').max(50),
  luggage: z.number().min(0).max(50),
  vehicleId: z.number().min(1, 'Please select a vehicle'),
  notes: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const driverApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  experienceYears: z.number().min(0, 'Experience years must be positive'),
  licenseType: z.string().min(1, 'License type is required'),
  hasOwnVehicle: z.boolean(),
  vehicleType: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  message: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type BookingFormData = z.infer<typeof bookingSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type DriverApplicationFormData = z.infer<typeof driverApplicationSchema>
export type LoginFormData = z.infer<typeof loginSchema>
