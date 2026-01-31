"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Car, Users, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Vehicle {
  id: number
  name: string
  name_tr: string
  description_tr: string
  capacity: number
  luggage_capacity: number
  image_url: string
  price_per_km: number
  base_price: number
  is_active: boolean
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    try {
      const response = await fetch("/api/vehicles")
      const data = await response.json()
      setVehicles(data.vehicles || [])
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-foreground">Araclar</h1>
        <p className="text-muted-foreground">Arac filonuzu yonetin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Arac Listesi ({vehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">
                Arac bulunamadi
              </p>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={vehicle.image_url || "/placeholder.svg"}
                      alt={vehicle.name_tr}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-foreground">{vehicle.name_tr}</h3>
                      <Badge variant={vehicle.is_active ? "default" : "secondary"}>
                        {vehicle.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{vehicle.description_tr}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{vehicle.capacity} Yolcu</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{vehicle.luggage_capacity} Bavul</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Baslangic Fiyati</span>
                      <span className="font-semibold text-foreground">
                        {vehicle.base_price.toLocaleString("tr-TR")} TL
                      </span>
                    </div>
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
