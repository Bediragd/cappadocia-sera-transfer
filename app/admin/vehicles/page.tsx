"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Car, Users, Briefcase, Plus, Edit, Trash2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface Vehicle {
  id: number
  name: string
  name_tr: string
  name_en: string
  name_ru: string
  name_hi: string
  model: string
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
}

interface VehicleFormData {
  name_tr: string
  name_en: string
  name_ru: string
  name_hi: string
  model: string
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
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<VehicleFormData>({
    name_tr: "",
    name_en: "",
    name_ru: "",
    name_hi: "",
    model: "",
    description_tr: "",
    description_en: "",
    description_ru: "",
    description_hi: "",
    capacity: 1,
    luggage_capacity: 1,
    image_url: "",
    price_per_km: 0,
    base_price: 0,
    is_active: true,
  })

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

  function openAddDialog() {
    setFormData({
      name_tr: "",
      name_en: "",
      name_ru: "",
      name_hi: "",
      model: "",
      description_tr: "",
      description_en: "",
      description_ru: "",
      description_hi: "",
      capacity: 1,
      luggage_capacity: 1,
      image_url: "",
      price_per_km: 0,
      base_price: 0,
      is_active: true,
    })
    setEditingVehicle(null)
    setIsAddDialogOpen(true)
  }

  function openEditDialog(vehicle: Vehicle) {
    setFormData({
      name_tr: vehicle.name_tr,
      name_en: vehicle.name_en,
      name_ru: vehicle.name_ru,
      name_hi: vehicle.name_hi,
      model: vehicle.model,
      description_tr: vehicle.description_tr,
      description_en: vehicle.description_en,
      description_ru: vehicle.description_ru,
      description_hi: vehicle.description_hi,
      capacity: vehicle.capacity,
      luggage_capacity: vehicle.luggage_capacity,
      image_url: vehicle.image_url,
      price_per_km: vehicle.price_per_km,
      base_price: vehicle.base_price,
      is_active: vehicle.is_active,
    })
    setEditingVehicle(vehicle)
    setIsAddDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles"
      const method = editingVehicle ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        fetchVehicles()
      }
    } catch (error) {
      console.error("Failed to save vehicle:", error)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" })
      setDeleteVehicle(null)
      fetchVehicles()
    } catch (error) {
      console.error("Failed to delete vehicle:", error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Araclar</h1>
          <p className="text-muted-foreground">Arac filonuzu yonetin</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Arac Ekle
        </Button>
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
                    <p className="text-sm text-muted-foreground line-clamp-2">{vehicle.description_tr}</p>
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
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">Temel Fiyat</p>
                      <p className="text-lg font-bold text-foreground">
                        {vehicle.base_price.toLocaleString("tr-TR")} TL
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(vehicle)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Duzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600"
                        onClick={() => setDeleteVehicle(vehicle)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Arac Duzenle" : "Yeni Arac Ekle"}</DialogTitle>
            <DialogDescription>
              Arac bilgilerini girin. Tum diller icin isim ve aciklama ekleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>İsim (Türkçe) *</Label>
                <Input
                  value={formData.name_tr}
                  onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Имя (Русский) *</Label>
                <Input
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>नाम (हिन्दी) *</Label>
                <Input
                  value={formData.name_hi}
                  onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Model *</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Orn: Mercedes E-Class"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Açıklama (Türkçe)</Label>
                <Textarea
                  value={formData.description_tr}
                  onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Описание (Русский)</Label>
                <Textarea
                  value={formData.description_ru}
                  onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>विवरण (हिन्दी)</Label>
                <Textarea
                  value={formData.description_hi}
                  onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kapasite (Yolcu) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bavul Kapasitesi *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.luggage_capacity}
                  onChange={(e) => setFormData({ ...formData, luggage_capacity: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resim URL</Label>
              <Input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/vehicle.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>KM Başı Fiyat (TL) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_km}
                  onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Temel Fiyat (TL) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                İptal
              </Button>
              <Button type="submit">
                {editingVehicle ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVehicle} onOpenChange={() => setDeleteVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aracı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteVehicle?.name_tr} aracını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteVehicle && handleDelete(deleteVehicle.id)}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

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
