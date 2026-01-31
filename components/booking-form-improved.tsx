"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"

// Google Maps tip tanımlamaları
declare global {
  interface Window {
    google: any
  }
}

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
  Calendar, 
  ArrowRight, 
  Users, 
  Fuel, 
  Settings, 
  CheckCircle, 
  MapPin, 
  Route, 
  Loader2,
  Map as MapIcon,
  Building2,
  Star,
  Navigation,
  Clock,
  Euro
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// Popüler Kapadokya Otelleri
const popularHotels = [
  {
    id: 1,
    name: "Museum Hotel",
    category: "5 Star",
    region: "Uçhisar",
    address: "Tekeli Mah. No:1, 50240 Uçhisar/Nevşehir",
    lat: 38.6274,
    lng: 34.8033,
    rating: 4.8,
    image: "/hotels/museum-hotel.jpg"
  },
  {
    id: 2,
    name: "Argos in Cappadocia",
    category: "5 Star",
    region: "Uçhisar",
    address: "Aşağı Mahalle, Kayabaşı Sk. No:25, 50240 Uçhisar/Nevşehir",
    lat: 38.6289,
    lng: 34.8045,
    rating: 4.9,
    image: "/hotels/argos.jpg"
  },
  {
    id: 3,
    name: "Sultan Cave Suites",
    category: "Boutique",
    region: "Göreme",
    address: "Aydınlı Mah. Belediye Cad. No:39, 50180 Göreme/Nevşehir",
    lat: 38.6436,
    lng: 34.8281,
    rating: 4.7,
    image: "/hotels/sultan-cave.jpg"
  },
  {
    id: 4,
    name: "Cappadocia Cave Suites",
    category: "Boutique",
    region: "Göreme",
    address: "Ünlü Sok. No:19, 50180 Göreme/Nevşehir",
    lat: 38.6445,
    lng: 34.8295,
    rating: 4.6,
    image: "/hotels/cave-suites.jpg"
  },
  {
    id: 5,
    name: "Kayakapi Premium Caves",
    category: "5 Star",
    region: "Ürgüp",
    address: "Kayakapı Mahallesi, 50400 Ürgüp/Nevşehir",
    lat: 38.6285,
    lng: 34.9145,
    rating: 4.8,
    image: "/hotels/kayakapi.jpg"
  },
  {
    id: 6,
    name: "Mithra Cave Hotel",
    category: "4 Star",
    region: "Göreme",
    address: "Hakki Pasa Meydani No:1, 50180 Göreme/Nevşehir",
    lat: 38.6423,
    lng: 34.8267,
    rating: 4.5,
    image: "/hotels/mithra.jpg"
  },
  {
    id: 7,
    name: "Seki Cave Suites",
    category: "Boutique",
    region: "Uçhisar",
    address: "Göreme Cad. No:58, 50240 Uçhisar/Nevşehir",
    lat: 38.6298,
    lng: 34.8062,
    rating: 4.7,
    image: "/hotels/seki.jpg"
  },
  {
    id: 8,
    name: "Gamirasu Hotel",
    category: "4 Star",
    region: "Ayvali",
    address: "Ayvali Köyü, 50500 Ürgüp/Nevşehir",
    lat: 38.5987,
    lng: 34.8745,
    rating: 4.6,
    image: "/hotels/gamirasu.jpg"
  }
]

const vehicles = [
  {
    id: 1,
    name: "Sedan",
    model: "Mercedes E-Class",
    image: "/black-mercedes-e-class-sedan-luxury-car.jpg",
    capacity: 3,
    luggage: 2,
    features: ["Klima", "Wi-Fi", "Şarj Soketi", "Deri Koltuk"],
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
    features: ["Klima", "Wi-Fi", "Şarj Soketi", "TV Ekran", "Minibar"],
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
    features: ["Klima", "Wi-Fi", "Geniş Bagaj", "USB Şarj"],
    pricePerKm: 25,
    basePrice: 400,
  },
]

const airports = {
  nevsehir: {
    name: "Nevşehir Kapadokya Havalimanı (NAV)",
    lat: 38.7719,
    lng: 34.5347,
    address: "Nevşehir Kapadokya Havalimanı, Tuzköy, Gülşehir, Nevşehir",
  },
  kayseri: {
    name: "Kayseri Erkilet Havalimanı (ASR)",
    lat: 38.7739,
    lng: 35.4956,
    address: "Kayseri Erkilet Havalimanı, Kayseri",
  },
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

export function BookingFormImproved() {
  const t = useTranslations()
  const [transferType, setTransferType] = useState("")
  const [selectedAirport, setSelectedAirport] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<typeof popularHotels[0] | null>(null)
  const [customLocation, setCustomLocation] = useState("")
  const [distance, setDistance] = useState<number | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")
  const [locationMethod, setLocationMethod] = useState<"popular" | "custom" | "map">("popular")
  const [searchQuery, setSearchQuery] = useState("")

  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<any>(null)

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

  // Google Maps yükleme
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== "undefined" && !window.google) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initMap
        document.head.appendChild(script)
      } else if (window.google) {
        initMap()
      }
    }
    if (locationMethod === "map") {
      loadGoogleMaps()
    }
  }, [locationMethod])

  // Harita başlatma
  const initMap = useCallback(() => {
    if (mapContainerRef.current && window.google && !mapRef.current) {
      // Kapadokya merkez koordinatları
      const cappadociaCenter = { lat: 38.6436, lng: 34.8281 }
      
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: cappadociaCenter,
        zoom: 11,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      })

      // Popüler otelleri haritaya ekle
      popularHotels.forEach((hotel) => {
        const marker = new window.google.maps.Marker({
          position: { lat: hotel.lat, lng: hotel.lng },
          map: mapRef.current!,
          title: hotel.name,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        })

        marker.addListener("click", () => {
          selectHotelFromMap(hotel)
        })
      })

      // Haritaya tıklama ile özel konum seçimi
      mapRef.current.addListener("click", (e: any) => {
        if (e.latLng) {
          addCustomMarker(e.latLng)
        }
      })
    }
  }, [])

  const selectHotelFromMap = (hotel: typeof popularHotels[0]) => {
    setSelectedHotel(hotel)
    setLocationMethod("popular")
    calculateDistanceForHotel(hotel)
  }

  const addCustomMarker = (location: any) => {
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapRef.current!,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    })

    // Geocoding ile adres al
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location }, (results: any, status: any) => {
      if (status === "OK" && results?.[0]) {
        setCustomLocation(results[0].formatted_address)
        calculateDistanceForCustom(location)
      }
    })
  }

  const calculateDistanceForHotel = async (hotel: typeof popularHotels[0]) => {
    if (!selectedAirport) return

    setIsCalculating(true)
    try {
      const service = new window.google.maps.DistanceMatrixService()
      const airport = airports[selectedAirport as keyof typeof airports]

      const origin = transferType === "airport-hotel" 
        ? airport.address 
        : hotel.address
      const destination = transferType === "airport-hotel" 
        ? hotel.address 
        : airport.address

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
      }
    } catch (error) {
      console.error("Mesafe hesaplama hatası:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const calculateDistanceForCustom = async (location: any) => {
    if (!selectedAirport) return

    setIsCalculating(true)
    try {
      const service = new window.google.maps.DistanceMatrixService()
      const airport = airports[selectedAirport as keyof typeof airports]

      const airportLatLng = new window.google.maps.LatLng(airport.lat, airport.lng)
      
      const origin = transferType === "airport-hotel" ? airportLatLng : location
      const destination = transferType === "airport-hotel" ? location : airportLatLng

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
      }
    } catch (error) {
      console.error("Mesafe hesaplama hatası:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const calculatePrice = (vehicle: typeof vehicles[0]) => {
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

  const filteredHotels = popularHotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedVehicle || !distance) return

    setIsSubmitting(true)

    try {
      const airport = airports[selectedAirport as keyof typeof airports]
      const hotelLocation = selectedHotel?.address || customLocation
      const pickupLocation = transferType === "airport-hotel" ? airport.name : hotelLocation
      const dropoffLocation = transferType === "airport-hotel" ? hotelLocation : airport.name

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

  const showVehicles = selectedAirport && transferType && distance !== null

  return (
    <section id="booking" className="py-20 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Rezervasyon Yap
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kapadokya transfer hizmetimizden faydalanmak için rezervasyon formunu doldurun
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sol Taraf - Form */}
            <div className="space-y-6">
              {/* Transfer Tipi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Transfer Tipi
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
                      <span className="text-sm">Havalimanı → Otel</span>
                    </Button>
                    <Button
                      type="button"
                      variant={transferType === "hotel-airport" ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setTransferType("hotel-airport")}
                    >
                      <ArrowRight className="w-6 h-6 rotate-180" />
                      <span className="text-sm">Otel → Havalimanı</span>
                    </Button>
                  </div>

                  {transferType && (
                    <div className="space-y-3">
                      <Label>Havalimanı Seçin</Label>
                      <Select value={selectedAirport} onValueChange={setSelectedAirport}>
                        <SelectTrigger>
                          <SelectValue placeholder="Havalimanı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nevsehir">
                            {airports.nevsehir.name}
                          </SelectItem>
                          <SelectItem value="kayseri">
                            {airports.kayseri.name}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Konum Seçimi */}
              {selectedAirport && transferType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Otel / Konum Seçimi
                    </CardTitle>
                    <CardDescription>
                      Popüler otellerden seçin veya haritadan konum belirleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={locationMethod} onValueChange={(v) => setLocationMethod(v as any)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="popular">
                          <Building2 className="w-4 h-4 mr-2" />
                          Popüler Oteller
                        </TabsTrigger>
                        <TabsTrigger value="map">
                          <MapIcon className="w-4 h-4 mr-2" />
                          Harita
                        </TabsTrigger>
                        <TabsTrigger value="custom">
                          <Navigation className="w-4 h-4 mr-2" />
                          Özel Adres
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="popular" className="mt-4 space-y-4">
                        <Input
                          placeholder="Otel ara..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                        <ScrollArea className="h-100 pr-4">
                          <div className="space-y-3">
                            {filteredHotels.map((hotel) => (
                              <Card
                                key={hotel.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  selectedHotel?.id === hotel.id ? "ring-2 ring-primary" : ""
                                }`}
                                onClick={() => {
                                  setSelectedHotel(hotel)
                                  calculateDistanceForHotel(hotel)
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <Building2 className="w-8 h-8 text-primary shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm truncate">{hotel.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {hotel.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{hotel.region}</span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-2">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-medium">{hotel.rating}</span>
                                      </div>
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
                      </TabsContent>

                      <TabsContent value="map" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Haritadan istediğiniz konumu seçin. Kırmızı işaretler popüler otelleri gösterir.
                          </p>
                          <div
                            ref={mapContainerRef}
                            className="w-full h-100 rounded-lg border"
                          />
                          {customLocation && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-900">
                                Seçilen Konum:
                              </p>
                              <p className="text-sm text-green-700 mt-1">{customLocation}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="custom" className="mt-4">
                        <div className="space-y-3">
                          <Label>Otel Adresi</Label>
                          <Input
                            placeholder="Otel adresinizi girin..."
                            value={customLocation}
                            onChange={(e) => setCustomLocation(e.target.value)}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              // Custom location için mesafe hesaplama
                              // Geocoding yapıp calculateDistanceForCustom çağır
                            }}
                            disabled={!customLocation || isCalculating}
                            className="w-full"
                          >
                            {isCalculating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Hesaplanıyor...
                              </>
                            ) : (
                              <>
                                <Route className="w-4 h-4 mr-2" />
                                Mesafe Hesapla
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Mesafe ve Süre Bilgisi */}
              {distance !== null && duration && (
                <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-full">
                          <Route className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mesafe</p>
                          <p className="text-2xl font-bold text-gray-900">{distance} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-full">
                          <Clock className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Süre</p>
                          <p className="text-2xl font-bold text-gray-900">{duration}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sağ Taraf - Araç Seçimi ve Form Devamı */}
            <div className="space-y-6">
              {showVehicles && (
                <>
                  {/* Araç Seçimi */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Araç Seçimi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {vehicles.map((vehicle) => (
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
                                    <h4 className="font-semibold">{vehicle.name}</h4>
                                    <p className="text-sm text-gray-600">{vehicle.model}</p>
                                  </div>
                                  {selectedVehicle === vehicle.id && (
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {vehicle.capacity}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Fuel className="w-4 h-4" />
                                    {vehicle.luggage}
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
                      ))}
                    </CardContent>
                  </Card>

                  {/* Müşteri Bilgileri Formu */}
                  {selectedVehicle && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Müşteri Bilgileri</CardTitle>
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
                                    <Input {...field} placeholder="Ad Soyad" />
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
                                    <Input {...field} type="email" placeholder="ornek@email.com" />
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
                                    <Input {...field} placeholder="+90 5XX XXX XX XX" />
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
                                    <FormLabel>Saat</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="time" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="passengers"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Yolcu Sayısı</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      min={1}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notlar (Opsiyonel)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder="Özel talepleriniz..." />
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
                                      KVKK metnini okudum ve kabul ediyorum
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
                                  Rezervasyon Yapılıyor...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  Rezervasyonu Tamamla
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
              Rezervasyon Başarılı!
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Rezervasyonunuz başarıyla oluşturuldu.</p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">
                  Rezervasyon Numaranız:
                </p>
                <p className="text-2xl font-bold text-primary mt-1">{bookingNumber}</p>
              </div>
              <p className="text-sm">
                Rezervasyon detayları e-posta adresinize gönderildi.
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setIsSubmitted(false)}>Tamam</Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
