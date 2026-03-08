"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  ArrowRight, 
  Users, 
  Fuel, 
  Settings, 
  CheckCircle, 
  Route, 
  Loader2,
  Building2,
  Star,
  Euro,
  AlertCircle
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Varsayılan otel listesi (API'den gelmezse kullanılır)
const defaultHotels = [
  { id: 1, name: "Museum Hotel", category: "5 Star", region: "Uçhisar", rating: 4.8 },
  { id: 2, name: "Argos in Cappadocia", category: "5 Star", region: "Uçhisar", rating: 4.9 },
  { id: 3, name: "Sultan Cave Suites", category: "Boutique", region: "Göreme", rating: 4.7 },
  { id: 4, name: "Cappadocia Cave Suites", category: "Boutique", region: "Göreme", rating: 4.6 },
  { id: 5, name: "Kayakapi Premium Caves", category: "5 Star", region: "Ürgüp", rating: 4.8 },
  { id: 6, name: "Mithra Cave Hotel", category: "4 Star", region: "Göreme", rating: 4.5 },
  { id: 7, name: "Seki Cave Suites", category: "Boutique", region: "Uçhisar", rating: 4.7 },
  { id: 8, name: "Gamirasu Hotel", category: "4 Star", region: "Ayvali", rating: 4.6 },
]

// Slug'a göre kısa etiket (9-1 → 9+1 gibi). Diğer araçlar name_tr ile gösterilir.
const SLUG_LABELS: Record<string, string> = {
  "9-1": "9+1",
  "10-1": "10+1",
  "11-1": "11+1",
  "12-1": "12+1",
}

type VehicleOption = {
  id: number
  slug: string
  name: string
  model: string
  image: string
  capacity: number
  luggage: number
  base_price: number
}

const airports: Record<string, { name: string }> = {
  nevsehir: { name: "Nevşehir Kapadokya Havalimanı (NAV)" },
  kayseri: { name: "Kayseri Erkilet Havalimanı (ASR)" },
}

const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Ad Soyad en az 2 karakter olmalı"),
  customerEmail: z.string().email("Geçerli bir e-posta adresi girin"),
  customerPhone: z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
  pickupDate: z.string().min(1, "Tarih seçmelisiniz"),
  pickupTime: z.string().min(1, "Saat seçmelisiniz"),
  passengers: z.number().min(1, "En az 1 yolcu olmalı"),
  notes: z.string().optional(),
  kvkkAccepted: z.boolean().refine((val) => val === true, "KVKK onaylamanız gerekiyor"),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

type HotelItem = { id: number; name: string; category?: string; region?: string; rating?: number }

export function BookingFormImproved() {
  const t = useTranslations()
  const [transferType, setTransferType] = useState("")
  const [selectedAirport, setSelectedAirport] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null)
  const [hotelList, setHotelList] = useState<HotelItem[]>(defaultHotels)
  const [occupiedSlots, setOccupiedSlots] = useState<{ pickup_location: string; dropoff_location: string; pickup_time: string }[]>([])
  const [vehicleList, setVehicleList] = useState<VehicleOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      pickupDate: "",
      pickupTime: "",
      passengers: 1,
      notes: "",
      kvkkAccepted: false,
    },
  })

  // Otelleri API'den yükle
  useEffect(() => {
    fetch("/api/hotels")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHotelList(data.map((h: { id: number; name: string; category?: string; region?: string; rating?: number }) => ({
            id: h.id,
            name: h.name,
            category: h.category,
            region: h.region,
            rating: h.rating,
          })))
        }
      })
      .catch(() => {})
  }, [])

  // Admin panelinde eklenen tüm aktif araçları API'den yükle (kullanıcı binmek istediği aracı seçer)
  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data: { vehicles?: { id: number; slug: string; name_tr: string; model: string; image_url: string | null; capacity: number; luggage_capacity: number; base_price: number }[] }) => {
        const list = data.vehicles || []
        const options = list
          .sort((a: { capacity: number }, b: { capacity: number }) => a.capacity - b.capacity)
          .map((v: { id: number; slug: string; name_tr: string; model: string; image_url: string | null; capacity: number; luggage_capacity: number; base_price: number }) => ({
            id: v.id,
            slug: v.slug,
            name: v.name_tr,
            model: v.model,
            image: v.image_url || "/white-mercedes-sprinter-minibus-passenger-van.jpg",
            capacity: v.capacity,
            luggage: v.luggage_capacity,
            base_price: Number(v.base_price),
          }))
        setVehicleList(options)
      })
      .catch(() => {})
  }, [])

  // Seçilen tarih için dolu slotları getir
  const pickupDate = form.watch("pickupDate")
  useEffect(() => {
    if (!pickupDate) {
      setOccupiedSlots([])
      return
    }
    fetch(`/api/bookings/slots?date=${pickupDate}`)
      .then((res) => res.json())
      .then((data) => setOccupiedSlots(data.slots || []))
      .catch(() => setOccupiedSlots([]))
  }, [pickupDate])

  const airportName = selectedAirport ? airports[selectedAirport]?.name : ""
  const hotelName = selectedHotel?.name ?? ""
  const isSlotOccupied = (time: string) => {
    if (!airportName || !hotelName) return false
    const pickup = transferType === "airport-hotel" ? airportName : hotelName
    const dropoff = transferType === "airport-hotel" ? hotelName : airportName
    const timeStr = time.length === 5 ? time : time.slice(0, 5)
    return occupiedSlots.some(
      (s) =>
        s.pickup_location === pickup && s.dropoff_location === dropoff &&
        (s.pickup_time?.toString().slice(0, 5) === timeStr || s.pickup_time === time)
    )
  }

  const calculatePrice = (vehicle: VehicleOption) => vehicle.base_price

  const getSelectedVehiclePrice = () => {
    if (!selectedVehicle) return null
    const vehicle = vehicleList.find((v) => v.id === selectedVehicle)
    if (!vehicle) return null
    return calculatePrice(vehicle)
  }

  const filteredHotels = hotelList.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.region?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedVehicle || !selectedHotel || !selectedAirport) return

    setIsSubmitting(true)
    try {
      const airport = airports[selectedAirport]
      const pickupLocation = transferType === "airport-hotel" ? airport.name : selectedHotel.name
      const dropoffLocation = transferType === "airport-hotel" ? selectedHotel.name : airport.name

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          pickupLocation,
          dropoffLocation,
          pickupDate: data.pickupDate,
          pickupTime: data.pickupTime,
          passengers: data.passengers,
          luggage: 0,
          vehicleId: selectedVehicle,
          notes: data.notes,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setBookingNumber(result.bookingNumber)
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error("Rezervasyon hatası:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showVehicles = selectedAirport && transferType && selectedHotel

  return (
    <section id="rezervasyon" className="py-20 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("booking.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("booking.subtitle")}
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sol Taraf - Form */}
            <div className="space-y-6">
              {/* Transfer tipi ve Havalimanı */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    {t("booking.transferType")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={transferType === "airport-hotel" ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setTransferType("airport-hotel")}
                    >
                      <ArrowRight className="w-6 h-6" />
                      <span className="text-sm">{t("booking.airportToHotel")}</span>
                    </Button>
                    <Button
                      type="button"
                      variant={transferType === "hotel-airport" ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setTransferType("hotel-airport")}
                    >
                      <ArrowRight className="w-6 h-6 rotate-180" />
                      <span className="text-sm">{t("booking.hotelToAirport")}</span>
                    </Button>
                  </div>

                  {transferType && (
                    <div className="space-y-3">
                      <Label>{t("booking.selectAirport")}</Label>
                      <Select value={selectedAirport} onValueChange={setSelectedAirport}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("booking.selectAirport")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nevsehir">{airports.nevsehir.name}</SelectItem>
                          <SelectItem value="kayseri">{airports.kayseri.name}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Otel seçimi */}
              {selectedAirport && transferType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {t("booking.selectHotel")}
                    </CardTitle>
                    <CardDescription>
                      {t("booking.hotelDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder={t("common.search") + "..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-4"
                    />
                    <ScrollArea className="h-[220px] pr-4">
                      <div className="space-y-3">
                        {filteredHotels.map((hotel) => (
                          <Card
                            key={hotel.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedHotel?.id === hotel.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedHotel(hotel)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Building2 className="w-8 h-8 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">{hotel.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {hotel.category && (
                                      <Badge variant="secondary" className="text-xs">{hotel.category}</Badge>
                                    )}
                                    {hotel.region && (
                                      <span className="text-xs text-gray-500">{hotel.region}</span>
                                    )}
                                  </div>
                                  {hotel.rating != null && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs font-medium">{hotel.rating}</span>
                                    </div>
                                  )}
                                </div>
                                {selectedHotel?.id === hotel.id && (
                                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sağ Taraf - Araç Seçimi ve Form Devamı */}
            <div className="space-y-6">
              {showVehicles && (
                <>
                  {/* Araç Seçimi - Admin panelinde eklenen tüm aktif araçlar listelenir */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {t("booking.selectVehicle")}
                      </CardTitle>
                      <CardDescription>
                        {t("booking.selectVehicleDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {vehicleList.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          Araç listesi yükleniyor...
                        </p>
                      ) : (
                        vehicleList.map((vehicle) => (
                          <Card
                            key={vehicle.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedVehicle === vehicle.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedVehicle(vehicle.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <img
                                  src={vehicle.image}
                                  alt={vehicle.model}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-semibold">
                                        {SLUG_LABELS[vehicle.slug] ?? vehicle.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">{vehicle.model} • {vehicle.capacity} yolcu</p>
                                    </div>
                                    {selectedVehicle === vehicle.id && (
                                      <CheckCircle className="w-5 h-5 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {vehicle.capacity} yolcu
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Fuel className="w-4 h-4" />
                                      {vehicle.luggage} bavul
                                    </span>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Euro className="w-5 h-5 text-green-600" />
                                      <span className="text-2xl font-bold text-green-600">
                                        {calculatePrice(vehicle)} TL
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Müşteri Bilgileri Formu */}
                  {selectedVehicle && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("booking.customerDetails")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="customerName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ad Soyad</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder={t("booking.placeholderName")} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="customerEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>E-posta</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" placeholder={t("booking.placeholderEmail")} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="customerPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefon</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder={t("booking.placeholderPhone")} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="pickupDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tarih</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="pickupTime"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("booking.pickupTime")}</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="time" />
                                    </FormControl>
                                    {pickupDate && field.value && isSlotOccupied(field.value) && (
                                      <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{t("booking.slotFull")} – {t("booking.slotFullWarning")}</span>
                                      </div>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {pickupDate && occupiedSlots.length > 0 && airportName && hotelName && (
                              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                                <p className="font-medium mb-1">{t("booking.slotFull")} {t("booking.pickupTime")}:</p>
                                <p className="text-muted-foreground">
                                  {occupiedSlots
                                    .filter((s) => {
                                      const p = transferType === "airport-hotel" ? airportName : hotelName
                                      const d = transferType === "airport-hotel" ? hotelName : airportName
                                      return s.pickup_location === p && s.dropoff_location === d
                                    })
                                    .map((s) => (s.pickup_time?.toString?.() ?? s.pickup_time).slice(0, 5))
                                    .filter((v, i, a) => a.indexOf(v) === i)
                                    .join(", ") || "—"}
                                </p>
                              </div>
                            )}

                            <FormField
                              control={form.control}
                              name="passengers"
                              render={({ field }) => {
                                const maxPassengers = vehicleList.find((v) => v.id === selectedVehicle)?.capacity ?? 12
                                return (
                                  <FormItem>
                                    <FormLabel>{t("booking.passengers")}</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        min={1}
                                        max={maxPassengers}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value, 10)
                                          field.onChange(isNaN(val) ? 1 : Math.min(val, maxPassengers))
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )
                              }}
                            />

                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notlar (Opsiyonel)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder={t("booking.placeholderNotes")} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="kvkkAccepted"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm">
                                      {t("booking.kvkkAccept")}
                                    </FormLabel>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />

                            {/* Fiyat Özeti */}
                            <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-900">
                                  Toplam Tutar:
                                </span>
                                <span className="text-3xl font-bold text-green-600">
                                  {getSelectedVehiclePrice()} TL
                                </span>
                              </div>
                            </div>

                            <Button
                              type="submit"
                              className="w-full h-12 text-lg"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  {t("common.loading")}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  {t("booking.requestBooking")}
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Başarı Dialogu */}
      <Dialog open={isSubmitted} onOpenChange={setIsSubmitted}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              {t("booking.bookingSuccess")}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>{t("booking.pendingApproval")}</p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">
                  {t("booking.bookingNumber")}:
                </p>
                <p className="text-2xl font-bold text-primary mt-1">{bookingNumber}</p>
              </div>
              <p className="text-sm">
                {t("booking.confirmAfterAdmin")}
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setIsSubmitted(false)}>{t("common.close")}</Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
