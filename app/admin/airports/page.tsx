"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Plane, Plus, Pencil, Trash2, MapPin } from "lucide-react"
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
import { Label } from "@/components/ui/label"

interface Airport {
  id: number
  code: string
  name_tr: string
  name_en: string
  name_ru: string
  name_hi: string
  latitude: number | null
  longitude: number | null
  address: string | null
  is_active: boolean
}

const EMPTY_FORM = {
  code: "",
  nameTr: "",
  nameEn: "",
  nameRu: "",
  nameHi: "",
  latitude: "",
  longitude: "",
  address: "",
}

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Airport | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAirports()
  }, [])

  async function fetchAirports() {
    try {
      const response = await fetch("/api/airports?all=true")
      const data = await response.json()
      setAirports(data.airports || [])
    } catch (error) {
      console.error("Failed to fetch airports:", error)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingId(null)
    setFormData({ ...EMPTY_FORM })
    setIsFormOpen(true)
  }

  function openEdit(airport: Airport) {
    setEditingId(airport.id)
    setFormData({
      code: airport.code || "",
      nameTr: airport.name_tr || "",
      nameEn: airport.name_en || "",
      nameRu: airport.name_ru || "",
      nameHi: airport.name_hi || "",
      latitude: airport.latitude != null ? String(airport.latitude) : "",
      longitude: airport.longitude != null ? String(airport.longitude) : "",
      address: airport.address || "",
    })
    setIsFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      }
      const url = editingId ? `/api/airports/${editingId}` : "/api/airports"
      const method = editingId ? "PATCH" : "POST"
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setIsFormOpen(false)
      setEditingId(null)
      setFormData({ ...EMPTY_FORM })
      fetchAirports()
    } catch (error) {
      console.error("Failed to save airport:", error)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(airport: Airport) {
    try {
      await fetch(`/api/airports/${airport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !airport.is_active }),
      })
      fetchAirports()
    } catch (error) {
      console.error("Failed to toggle airport:", error)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/airports/${id}`, { method: "DELETE" })
      setDeleteTarget(null)
      fetchAirports()
    } catch (error) {
      console.error("Failed to delete airport:", error)
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Havalimanlari</h1>
          <p className="text-muted-foreground">Transfer noktasi havalimanlarini yonetin</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Havalimani
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Havalimani Listesi ({airports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {airports.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">
                Havalimani bulunamadi
              </p>
            ) : (
              airports.map((airport) => (
                <div key={airport.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">{airport.code}</Badge>
                        <h3 className="font-medium text-foreground">{airport.name_tr}</h3>
                      </div>
                      {airport.address && (
                        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {airport.address}
                        </p>
                      )}
                    </div>
                    <Badge variant={airport.is_active ? "default" : "outline"}>
                      {airport.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleActive(airport)}>
                      {airport.is_active ? "Pasifleştir" : "Aktifleştir"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(airport)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-600"
                      onClick={() => setDeleteTarget(airport)}
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
            <DialogTitle>{editingId ? "Havalimani Duzenle" : "Yeni Havalimani"}</DialogTitle>
            <DialogDescription>Havalimani bilgilerini girin</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Kod (IATA) *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="NAV"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameTr">Ad (TR) *</Label>
                <Input
                  id="nameTr"
                  value={formData.nameTr}
                  onChange={(e) => setFormData({ ...formData, nameTr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">Ad (EN)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameRu">Ad (RU)</Label>
                <Input
                  id="nameRu"
                  value={formData.nameRu}
                  onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameHi">Ad (HI)</Label>
                <Input
                  id="nameHi"
                  value={formData.nameHi}
                  onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Enlem</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="38.7719"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Boylam</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="34.5347"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
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
            <AlertDialogTitle>Havalimanini Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name_tr} havalimanini pasife almak istediginizden emin misiniz?
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
