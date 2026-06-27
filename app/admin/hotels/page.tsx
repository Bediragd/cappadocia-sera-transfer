"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Hotel, Plus, Pencil, Trash2, Search, Star, MapPin } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

interface HotelItem {
  id: number
  name: string
  category: string | null
  region: string | null
  address: string | null
  rating: number | null
  image_url: string | null
  phone: string | null
  price_range: string | null
  description: string | null
  is_active: boolean
}

const EMPTY_FORM = {
  name: "",
  category: "",
  region: "",
  address: "",
  rating: "4.5",
  imageUrl: "",
  phone: "",
  priceRange: "",
  description: "",
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HotelItem | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchHotels()
  }, [])

  async function fetchHotels() {
    try {
      const response = await fetch("/api/hotels?all=true")
      const data = await response.json()
      setHotels(Array.isArray(data) ? data : data.hotels || [])
    } catch (error) {
      console.error("Failed to fetch hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditingId(null)
    setFormData({ ...EMPTY_FORM })
    setIsFormOpen(true)
  }

  function openEdit(hotel: HotelItem) {
    setEditingId(hotel.id)
    setFormData({
      name: hotel.name || "",
      category: hotel.category || "",
      region: hotel.region || "",
      address: hotel.address || "",
      rating: hotel.rating != null ? String(hotel.rating) : "4.5",
      imageUrl: hotel.image_url || "",
      phone: hotel.phone || "",
      priceRange: hotel.price_range || "",
      description: hotel.description || "",
    })
    setIsFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        rating: formData.rating ? Number(formData.rating) : 4.5,
      }
      const url = editingId ? `/api/hotels/${editingId}` : "/api/hotels"
      const method = editingId ? "PATCH" : "POST"
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setIsFormOpen(false)
      setEditingId(null)
      setFormData({ ...EMPTY_FORM })
      fetchHotels()
    } catch (error) {
      console.error("Failed to save hotel:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/hotels/${id}`, { method: "DELETE" })
      setDeleteTarget(null)
      fetchHotels()
    } catch (error) {
      console.error("Failed to delete hotel:", error)
    }
  }

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hotel.region || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-foreground">Oteller</h1>
          <p className="text-muted-foreground">Rezervasyon formundaki otel listesini yonetin</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Otel
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ara (isim, bolge)..."
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
            <Hotel className="w-5 h-5" />
            Otel Listesi ({filteredHotels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">
                Otel bulunamadi
              </p>
            ) : (
              filteredHotels.map((hotel) => (
                <div key={hotel.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{hotel.name}</h3>
                      {hotel.region && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {hotel.region}
                        </p>
                      )}
                    </div>
                    <Badge variant={hotel.is_active ? "default" : "outline"}>
                      {hotel.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    {hotel.rating != null && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {Number(hotel.rating).toFixed(1)}
                      </span>
                    )}
                    {hotel.category && <span>{hotel.category}</span>}
                    {hotel.price_range && <span>{hotel.price_range}</span>}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(hotel)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-600"
                      onClick={() => setDeleteTarget(hotel)}
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
            <DialogTitle>{editingId ? "Otel Duzenle" : "Yeni Otel"}</DialogTitle>
            <DialogDescription>Otel bilgilerini girin</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Otel Adi *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Bolge</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Goreme"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Butik / 5 Yildiz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Puan</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRange">Fiyat Araligi</Label>
                <Input
                  id="priceRange"
                  value={formData.priceRange}
                  onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                  placeholder="$$ / $$$"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Gorsel URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Aciklama</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <AlertDialogTitle>Oteli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} otelini listeden kaldirmak istediginizden emin misiniz?
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
