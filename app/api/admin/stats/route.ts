import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const [
      bookingsCount,
      pendingBookings,
      confirmedBookings,
      driversCount,
      vehiclesCount,
      messagesCount,
      applicationsCount,
      revenueResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM bookings`,
      sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'`,
      sql`SELECT COUNT(*) as count FROM drivers WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM vehicles WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM contact_messages WHERE is_read = false`,
      sql`SELECT COUNT(*) as count FROM driver_applications WHERE status = 'pending'`,
      sql`SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE payment_status = 'paid'`
    ])

    // Get recent bookings
    const recentBookings = await sql`
      SELECT b.*, v.name_tr as vehicle_name
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `

    // Get monthly stats
    const monthlyStats = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as bookings,
        COALESCE(SUM(total_price), 0) as revenue
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `

    return NextResponse.json({
      stats: {
        totalBookings: bookingsCount[0]?.count || 0,
        pendingBookings: pendingBookings[0]?.count || 0,
        confirmedBookings: confirmedBookings[0]?.count || 0,
        activeDrivers: driversCount[0]?.count || 0,
        activeVehicles: vehiclesCount[0]?.count || 0,
        unreadMessages: messagesCount[0]?.count || 0,
        pendingApplications: applicationsCount[0]?.count || 0,
        totalRevenue: revenueResult[0]?.total || 0
      },
      recentBookings,
      monthlyStats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
