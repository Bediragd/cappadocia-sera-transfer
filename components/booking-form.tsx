"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar, ArrowRight, Users, Fuel, Settings, CheckCircle, MapPin, Route, Loader2 } from "lucide-react"
import { google } from "googlemaps"

const vehicles = [
  {
    id: 1,
    name: "Sedan",
    model: "Mercedes E-Class",
    image: "/black-mercedes-e-class-sedan-luxury-car.jpg",
    capacity: 3,
    luggage: 2,
    features: ["Klima", "Wi-Fi", "Sarj Soketi", "Deri Koltuk"],
    pricePerKm: 12,
    basePrice: 200,
  },
  {
    id: 2,
    name: "VIP Minivan",
    model: "Mercedes Vito VIP",
    image: "/black-mercedes-vito-vip-minivan-luxury.jpg",
    capacity: 6,
    luggage: 6,
    features: ["Klima", "Wi-Fi", "Sarj Soketi", "TV Ekran", "Minibar"],
    pricePerKm: 18,
    basePrice: 300,
  },
  {
    id: 3,
    name: "Minibus",
    model: "Mercedes Sprinter",
    image: "/white-mercedes-sprinter-minibus-passenger-van.jpg",
    capacity: 12,
    luggage: 12,
    features: ["Klima", "Wi-Fi", "Genis Bagaj", "USB Sarj"],
    pricePerKm: 25,
    basePrice: 400,
  },
]

const airports = {
  nevsehir: {
    name: "Nevsehir Kapadokya Havalimani (NAV)",
    lat: 38.7719,
    lng: 34.5347,
    address: "Nevsehir Kapadokya Havalimani, Tuzkoy, Gulsehir, Nevsehir",
  },
  kayseri: {
    name: "Kayseri Erkilet Havalimani (ASR)",
    lat: 38.7739,
    lng: 35.4956,
    address: "Kayseri Erkilet Havalimani, Kayseri",
  },
}

const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Ad Soyad en az 2 karakter olmali"),
  customerEmail: z.string().email("Gecerli bir e-posta adresi girin"),
  customerPhone: z.string().min(10, "Telefon numarasi en az 10 karakter olmali"),
  pickupDate: z.string().min(1, "Tarih secmelisiniz"),
  pickupTime: z.string().min(1, "Saat secmelisiniz"),
  passengers: z.number().min(1, "En az 1 yolcu olmali"),
  notes: z.string().optional(),
  kvkkAccepted: z.boolean().refine((val) => val === true, "KVKK onaylamaniz gerekiyor"),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

export function BookingForm() {
  const t = useTranslations()
  const [transferType, setTransferType] = useState("")
  const [selectedAirport, setSelectedAirport] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [hotelAddress, setHotelAddress] = useState("")
  const [distance, setDistance] = useState<number | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [addressError, setAddressError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

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

  const showVehicles = selectedAirport && transferType && distance !== null

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== "undefined" && !window.google) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initAutocomplete
        document.head.appendChild(script)
      } else if (window.google) {
        initAutocomplete()
      }
    }
    loadGoogleMaps()
  }, [])

  const initAutocomplete = useCallback(() => {
    if (inputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "tr" },
        fields: ["formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          setHotelAddress(place.formatted_address)
        }
      })
    }
  }, [])

  const calculateDistance = async () => {
    if (!hotelAddress || !selectedAirport) {
      setAddressError("Lutfen otel adresini ve havalimanini secin")
      return
    }

    setIsCalculating(true)
    setAddressError("")

    try {
      const service = new window.google.maps.DistanceMatrixService()
      const airport = airports[selectedAirport as keyof typeof airports]

      const origin = transferType === "airport-hotel" ? airport.address : hotelAddress
      const destination = transferType === "airport-hotel" ? hotelAddress : airport.address

      const response = await service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      })

      if (response.rows[0]?.elements[0]?.status === "OK") {
        const distanceInMeters = response.rows[0].elements[0].distance.value
        const distanceInKm = Math.ceil(distanceInMeters / 1000)
        const durationText = response.rows[0].elements[0].duration.text

        setDistance(distanceInKm)
        setDuration(durationText)
      } else {
        setAddressError("Adres bulunamadi. Lutfen gecerli bir adres girin.")
      }
    } catch (error) {
      setAddressError("Mesafe hesaplanirken bir hata olustu. Lutfen tekrar deneyin.")
    } finally {
      setIsCalculating(false)
    }
  }

  const calculatePrice = (vehicle: (typeof vehicles)[0]) => {
    if (!distance) return vehicle.basePrice
    const calculatedPrice = distance * vehicle.pricePerKm
    return Math.max(calculatedPrice, vehicle.basePrice)
  }

  const getSelectedVehiclePrice = () => {
    if (!selectedVehicle || !distance) return null
    const vehicle = vehicles.find((v) => v.id === selectedVehicle)
    if (!vehicle) return null
    return calculatePrice(vehicle)
  }

  const price = getSelectedVehiclePrice()

  useEffect(() => {
    setDistance(null)
    setDuration(null)
    setSelectedVehicle(null)
  }, [selectedAirport, transferType])

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedVehicle || !distance) return

    setIsSubmitting(true)

    try {
      const airport = airports[selectedAirport as keyof typeof airports]
      const pickupLocation = transferType === "airport-hotel" ? airport.name : hotelAddress
      const dropoffLocation = transferType === "airport-hotel" ? hotelAddress : airport.name

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
      } else {
        throw new Error("Booking failed")
      }
    } catch (error) {
      console.error("Booking error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section id="rezervasyon" className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("booking.bookingSuccess")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("booking.bookingNumber")}: <span className="font-bold">{bookingNumber}</span>
              </p>
              <p className="text-muted-foreground mb-6">
                Rezervasyon detaylari e-posta adresinize gonderildi.
              </p>
              <Button onClick={() => {
                setIsSubmitted(false)
                form.reset()
                setSelectedVehicle(null)
                setDistance(null)
                setDuration(null)
                setHotelAddress("")
                setTransferType("")
                setSelectedAirport("")
              }}>
                Yeni Rezervasyon
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="rezervasyon" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary-foreground/80 font-medium mb-2 tracking-widest uppercase text-sm">
            {t("booking.title")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Transfer {t("booking.title")}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">{t("booking.subtitle")}</p>
        </div>

        {/* Step 1: Route Selection */}
        <Card className="max-w-4xl mx-auto bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Route className="w-5 h-5" />
              1. Rotanizi Belirleyin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Transfer Tipi</Label>
                <Select value={transferType} onValueChange={setTransferType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Transfer tipini secin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airport-hotel">Havalimani - Otel</SelectItem>
                    <SelectItem value="hotel-airport">Otel - Havalimani</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Havalimani</Label>
                <Select value={selectedAirport} onValueChange={setSelectedAirport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Havalimani secin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nevsehir">Nevsehir Kapadokya Havalimani (NAV)</SelectItem>
                    <SelectItem value="kayseri">Kayseri Erkilet Havalimani (ASR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedAirport && transferType && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {transferType === "airport-hotel" ? "Varis Adresi (Otel)" : "Alinacak Adres (Otel)"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      placeholder="Otel adini veya adresi yazin..."
                      className="flex-1"
                    />
                    <Button type="button" onClick={calculateDistance} disabled={isCalculating || !hotelAddress}>
                      {isCalculating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Hesaplaniyor
                        </>
                      ) : (
                        "Mesafe Hesapla"
                      )}
                    </Button>
                  </div>
                  {addressError && <p className="text-sm text-destructive">{addressError}</p>}
                </div>

                {distance !== null && duration && (
                  <div className="flex flex-wrap gap-4 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Route className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mesafe</p>
                        <p className="font-bold text-lg">{distance} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tahmini Sure</p>
                        <p className="font-bold text-lg">{duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Rota hesaplandi!</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Vehicle Selection */}
        {showVehicles && (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-primary-foreground mb-2">2. Aracinizi Secin</h3>
              <p className="text-primary-foreground/80">
                {distance} km mesafe icin arac fiyatlari
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
              {vehicles.map((vehicle) => {
                const vehiclePrice = calculatePrice(vehicle)
                return (
                  <Card
                    key={vehicle.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden ${
                      selectedVehicle === vehicle.id ? "ring-2 ring-accent" : "bg-card hover:scale-105"
                    }`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <div className="relative">
                      <img
                        src={vehicle.image || "/placeholder.svg"}
                        alt={vehicle.name}
                        className="w-full h-40 object-cover"
                      />
                      {selectedVehicle === vehicle.id && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-card-foreground">{vehicle.name}</h3>
                          <p className="text-muted-foreground text-sm">{vehicle.model}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{vehiclePrice} TL</p>
                          <p className="text-xs text-muted-foreground">{vehicle.pricePerKm} TL/km</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{vehicle.capacity} Kisi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-4 h-4" />
                          <span>{vehicle.luggage} Bavul</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {vehicle.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center gap-1"
                          >
                            <Settings className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Step 3: Customer Info Form */}
        {selectedVehicle && (
          <Card className="max-w-4xl mx-auto bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                3. Transfer Bilgilerinizi Girin
                {price && (
                  <span className="ml-auto text-accent font-bold text-xl">
                    {distance} km x {vehicles.find((v) => v.id === selectedVehicle)?.pricePerKm} TL = {price} TL
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("booking.customerName")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Adinizi girin" {...field} />
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
                          <FormLabel>{t("booking.customerPhone")}</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+90 5XX XXX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("booking.customerEmail")}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ornek@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="passengers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("booking.passengers")}</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(val) => field.onChange(parseInt(val))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Secin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from(
                                { length: vehicles.find((v) => v.id === selectedVehicle)?.capacity || 8 },
                                (_, i) => i + 1
                              ).map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Kisi
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("booking.pickupDate")}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <Label className="font-semibold">Rota Ozeti</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Kalkis: </span>
                        <span className="font-medium">
                          {transferType === "airport-hotel"
                            ? airports[selectedAirport as keyof typeof airports]?.name
                            : hotelAddress}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Varis: </span>
                        <span className="font-medium">
                          {transferType === "airport-hotel"
                            ? hotelAddress
                            : airports[selectedAirport as keyof typeof airports]?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mesafe: </span>
                        <span className="font-medium">{distance} km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tahmini Sure: </span>
                        <span className="font-medium">{duration}</span>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("booking.notes")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ucus numarasi, ozel istekler..."
                            className="resize-none"
                            {...field}
                          />
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
                          <FormLabel>
                            KVKK Aydinlatma Metni&apos;ni okudum ve kabul ediyorum.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="text-lg font-semibold text-foreground">
                      {t("booking.totalPrice")}: <span className="text-primary text-2xl">{price} TL</span>
                    </div>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gonderiliyor...
                        </>
                      ) : (
                        <>
                          {t("booking.confirmBooking")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
