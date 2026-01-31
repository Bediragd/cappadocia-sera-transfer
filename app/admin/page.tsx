"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Car,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Stats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  activeDrivers: number
  activeVehicles: number
  unreadMessages: number
  pendingApplications: number
  totalRevenue: number
}

interface RecentBooking {
  id: number
  booking_number: string
  customer_name: string
  pickup_date: string
  status: string
  total_price: number
  vehicle_name: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data.stats)
        setRecentBookings(data.recentBookings || [])
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Toplam Rezervasyon",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Bekleyen",
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Onaylanan",
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Aktif Sofor",
      value: stats?.activeDrivers || 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Aktif Arac",
      value: stats?.activeVehicles || 0,
      icon: Car,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Okunmamis Mesaj",
      value: stats?.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      title: "Bekleyen Basvuru",
      value: stats?.pendingApplications || 0,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Toplam Gelir",
      value: `${(stats?.totalRevenue || 0).toLocaleString("tr-TR")} TL`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
    }
    const labels: Record<string, string> = {
      pending: "Bekliyor",
      confirmed: "Onaylandi",
      completed: "Tamamlandi",
      cancelled: "Iptal",
    }
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Genel bakis ve istatistikler</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Son Rezervasyonlar</CardTitle>
            <CardDescription>En son alinan rezervasyonlar</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/bookings">Tumunu Gor</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henuz rezervasyon yok</p>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.booking_number} - {booking.vehicle_name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium text-foreground">
                      {booking.total_price?.toLocaleString("tr-TR")} TL
                    </p>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
