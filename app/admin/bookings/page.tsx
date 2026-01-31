"use client"

import { useEffect, useState } from "react"
import { Calendar, Search, Filter, Eye, Trash2, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Booking {
  id: number
  booking_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_location: string
  dropoff_location: string
  pickup_date: string
  pickup_time: string
  passengers: number
  luggage: number
  total_price: number
  status: string
  payment_status: string
  vehicle_name: string
  driver_name: string | null
  created_at: string
  notes: string | null
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  async function fetchBookings() {
    try {
      const url = statusFilter === "all" 
        ? "/api/bookings" 
        : `/api/bookings?status=${statusFilter}`
      const response = await fetch(url)
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchBookings()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/bookings/${id}`, { method: "DELETE" })
      setDeleteBooking(null)
      fetchBookings()
    } catch (error) {
      console.error("Failed to delete booking:", error)
    }
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      in_progress: "default",
      completed: "outline",
      cancelled: "destructive",
    }
    const labels: Record<string, string> = {
      pending: "Bekliyor",
      confirmed: "Onaylandi",
      in_progress: "Devam Ediyor",
      completed: "Tamamlandi",
      cancelled: "Iptal",
    }
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      paid: "default",
      refunded: "destructive",
    }
    const labels: Record<string, string> = {
      pending: "Odenmedi",
      paid: "Odendi",
      refunded: "Iade Edildi",
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rezervasyonlar</h1>
          <p className="text-muted-foreground">Tum rezervasyonlari yonetin</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ara (isim, numara, email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tumu</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="confirmed">Onaylanan</SelectItem>
                <SelectItem value="in_progress">Devam Eden</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="cancelled">Iptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Rezervasyon Listesi ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">No</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Musteri</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tarih</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Arac</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fiyat</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Durum</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Odeme</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Rezervasyon bulunamadi
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">
                        <span className="font-mono text-sm">{booking.booking_number}</span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-foreground">{booking.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-foreground">
                            {new Date(booking.pickup_date).toLocaleDateString("tr-TR")}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.pickup_time}</p>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{booking.vehicle_name || "-"}</td>
                      <td className="p-3 font-medium text-foreground">
                        {booking.total_price?.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="p-3">{getStatusBadge(booking.status)}</td>
                      <td className="p-3">{getPaymentBadge(booking.payment_status)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-600"
                                onClick={() => updateStatus(booking.id, "confirmed")}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-rose-600"
                                onClick={() => updateStatus(booking.id, "cancelled")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-600"
                            onClick={() => setDeleteBooking(booking)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rezervasyon Detayi</DialogTitle>
            <DialogDescription>
              {selectedBooking?.booking_number}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Musteri Adi</p>
                  <p className="font-medium">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{selectedBooking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-posta</p>
                  <p className="font-medium">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arac</p>
                  <p className="font-medium">{selectedBooking.vehicle_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alis Noktasi</p>
                  <p className="font-medium">{selectedBooking.pickup_location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Birakim Noktasi</p>
                  <p className="font-medium">{selectedBooking.dropoff_location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tarih / Saat</p>
                  <p className="font-medium">
                    {new Date(selectedBooking.pickup_date).toLocaleDateString("tr-TR")} - {selectedBooking.pickup_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yolcu / Bavul</p>
                  <p className="font-medium">
                    {selectedBooking.passengers} Yolcu, {selectedBooking.luggage} Bavul
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Fiyat</p>
                  <p className="font-medium text-lg">
                    {selectedBooking.total_price?.toLocaleString("tr-TR")} TL
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sofor</p>
                  <p className="font-medium">{selectedBooking.driver_name || "Atanmadi"}</p>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notlar</p>
                  <p className="font-medium">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBooking} onOpenChange={() => setDeleteBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rezervasyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteBooking?.booking_number} numarali rezervasyonu silmek istediginizden emin misiniz?
              Bu islem geri alinamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Iptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteBooking && handleDelete(deleteBooking.id)}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
