"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Users, Plus, Search, Trash2, Pencil, Car, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Driver {
  id: number
  full_name: string
  phone: string
  email: string | null
  license_number: string | null
  city: string | null
  own_vehicle: boolean
  vehicle_type: string | null
  vehicle_plate: string | null
  experience_years: number
  notes: string | null
  status: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  approved: "Aktif",
  rejected: "Reddedildi",
  inactive: "Pasif",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  inactive: "outline",
}

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  city: "",
  vehicleType: "",
  vehiclePlate: "",
  experienceYears: "",
  status: "approved",
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDrivers()
  }, [])

  async function fetchDrivers() {
    try {
      const response = await fetch("/api/drivers")
      const data = await response.json()
      setDrivers(data.drivers || [])
    } catch (error) {
      console.error("Failed to fetch drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingId(null)
    setFormData({ ...EMPTY_FORM })
    setIsFormOpen(true)
  }

  function openEdit(driver: Driver) {
    setEditingId(driver.id)
    setFormData({
      fullName: driver.full_name || "",
      phone: driver.phone || "",
      email: driver.email || "",
      licenseNumber: driver.license_number || "",
      city: driver.city || "",
      vehicleType: driver.vehicle_type || "",
      vehiclePlate: driver.vehicle_plate || "",
      experienceYears: driver.experience_years ? String(driver.experience_years) : "",
      status: driver.status || "approved",
    })
    setIsFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        experienceYears: formData.experienceYears ? Number(formData.experienceYears) : 0,
      }
      const url = editingId ? `/api/drivers/${editingId}` : "/api/drivers"
      const method = editingId ? "PATCH" : "POST"
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setIsFormOpen(false)
      setFormData({ ...EMPTY_FORM })
      setEditingId(null)
      fetchDrivers()
    } catch (error) {
      console.error("Failed to save driver:", error)
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(id: number, status: string) {
    try {
      await fetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchDrivers()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/drivers/${id}`, { method: "DELETE" })
      setDeleteTarget(null)
      fetchDrivers()
    } catch (error) {
      console.error("Failed to delete driver:", error)
    }
  }

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      (driver.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-foreground">Soforler</h1>
          <p className="text-muted-foreground">Sofor kadronuzu yonetin</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Sofor
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ara (isim, telefon, email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sofor Listesi ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrivers.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">
                Sofor bulunamadi
              </p>
            ) : (
              filteredDrivers.map((driver) => (
                <div key={driver.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{driver.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{driver.phone}</p>
                      {driver.email && (
                        <p className="text-sm text-muted-foreground">{driver.email}</p>
                      )}
                    </div>
                    <Badge variant={STATUS_VARIANTS[driver.status] || "secondary"}>
                      {STATUS_LABELS[driver.status] || driver.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {driver.city && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {driver.city}
                      </p>
                    )}
                    {(driver.vehicle_type || driver.vehicle_plate) && (
                      <p className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        {[driver.vehicle_type, driver.vehicle_plate].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    {driver.experience_years > 0 && (
                      <p>{driver.experience_years} yil tecrube</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Select
                      value={driver.status}
                      onValueChange={(value) => changeStatus(driver.id, value)}
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Aktif</SelectItem>
                        <SelectItem value="pending">Bekliyor</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                        <SelectItem value="rejected">Reddedildi</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(driver)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-600"
                      onClick={() => setDeleteTarget(driver)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sofor Duzenle" : "Yeni Sofor Ekle"}</DialogTitle>
            <DialogDescription>Sofor bilgilerini girin</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Sehir</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Ehliyet Numarasi</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Tecrube (yil)</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Arac Tipi</Label>
                <Input
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Plaka</Label>
                <Input
                  id="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Aktif</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Iptal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : editingId ? "Guncelle" : "Ekle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soforu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.full_name} adli soforu silmek istediginizden emin misiniz?
              Bu islem geri alinamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Iptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
