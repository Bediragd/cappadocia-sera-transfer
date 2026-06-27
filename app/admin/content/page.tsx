"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Share2, LayoutGrid, Image as ImageIcon, MapPin, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SETTING_KEYS,
  DEFAULT_SERVICES,
  DEFAULT_GALLERY,
  DEFAULT_FOOTER_REGIONS,
  parseJsonSetting,
  type ServiceItem,
  type GalleryItem,
} from "@/lib/settings-utils"

const ICON_OPTIONS = ["Plane", "Hotel", "Users", "Car"]

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  if (!message) return null
  return (
    <div
      className={
        type === "error"
          ? "p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
          : "p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-300 dark:bg-green-950/30 dark:border-green-900"
      }
    >
      {message}
    </div>
  )
}

export default function ContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [youtube, setYoutube] = useState("")
  const [twitter, setTwitter] = useState("")
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialMsg, setSocialMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesMsg, setServicesMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryMsg, setGalleryMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [regions, setRegions] = useState<string[]>(DEFAULT_FOOTER_REGIONS)
  const [regionsLoading, setRegionsLoading] = useState(false)
  const [regionsMsg, setRegionsMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  useEffect(() => {
    try {
      if (!localStorage.getItem("admin_user")) {
        router.replace("/admin/login")
        return
      }
    } catch {
      router.replace("/admin/login")
      return
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || {}
        setInstagram(s[SETTING_KEYS.socialInstagram] || "")
        setFacebook(s[SETTING_KEYS.socialFacebook] || "")
        setYoutube(s[SETTING_KEYS.socialYoutube] || "")
        setTwitter(s[SETTING_KEYS.socialTwitter] || "")
        setServices(parseJsonSetting<ServiceItem[]>(s[SETTING_KEYS.contentServices], DEFAULT_SERVICES))
        setGallery(parseJsonSetting<GalleryItem[]>(s[SETTING_KEYS.contentGallery], DEFAULT_GALLERY))
        setRegions(parseJsonSetting<string[]>(s[SETTING_KEYS.contentFooterRegions], DEFAULT_FOOTER_REGIONS))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  async function save(
    updates: Record<string, string>,
    setBusy: (v: boolean) => void,
    setMsg: (v: { type: "error" | "success"; text: string } | null) => void
  ) {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updates }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Kaydedilemedi" })
        return
      }
      setMsg({ type: "success", text: "Kaydedildi" })
    } catch {
      setMsg({ type: "error", text: "Bir hata oluştu" })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site Icerigi</h1>
        <p className="text-muted-foreground">Ana sayfa bolumlerini ve sosyal medya baglantilarini duzenleyin</p>
      </div>

      {/* Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Sosyal Medya
          </CardTitle>
          <CardDescription>Bos birakilan baglantilar footer'da gizlenir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialMsg && <Alert type={socialMsg.type} message={socialMsg.text} />}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input id="youtube" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." />
            </div>
          </div>
          <Button
            disabled={socialLoading}
            onClick={() =>
              save(
                {
                  [SETTING_KEYS.socialInstagram]: instagram.trim(),
                  [SETTING_KEYS.socialFacebook]: facebook.trim(),
                  [SETTING_KEYS.socialYoutube]: youtube.trim(),
                  [SETTING_KEYS.socialTwitter]: twitter.trim(),
                },
                setSocialLoading,
                setSocialMsg
              )
            }
          >
            {socialLoading ? "Kaydediliyor..." : "Sosyal Medyayi Kaydet"}
          </Button>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Hizmetler
          </CardTitle>
          <CardDescription>Ana sayfadaki hizmet kartlari</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {servicesMsg && <Alert type={servicesMsg.type} message={servicesMsg.text} />}
          {services.map((service, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[140px_1fr_auto] items-start p-3 rounded-lg border border-border">
              <div className="space-y-1">
                <Label className="text-xs">Ikon</Label>
                <Select
                  value={service.icon}
                  onValueChange={(value) =>
                    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, icon: value } : s)))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Input
                  value={service.title}
                  placeholder="Baslik"
                  onChange={(e) =>
                    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)))
                  }
                />
                <Textarea
                  value={service.description}
                  placeholder="Aciklama"
                  rows={2}
                  onChange={(e) =>
                    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)))
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setServices((prev) => [...prev, { icon: "Car", title: "", description: "" }])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Hizmet Ekle
            </Button>
            <Button
              disabled={servicesLoading}
              onClick={() =>
                save(
                  { [SETTING_KEYS.contentServices]: JSON.stringify(services) },
                  setServicesLoading,
                  setServicesMsg
                )
              }
            >
              {servicesLoading ? "Kaydediliyor..." : "Hizmetleri Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Galeri
          </CardTitle>
          <CardDescription>Gorsel yolu (/dosya.jpg) ve aciklama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {galleryMsg && <Alert type={galleryMsg.type} message={galleryMsg.text} />}
          {gallery.map((item, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-center p-3 rounded-lg border border-border">
              <Input
                value={item.src}
                placeholder="/gorsel.jpg"
                onChange={(e) =>
                  setGallery((prev) => prev.map((g, i) => (i === index ? { ...g, src: e.target.value } : g)))
                }
              />
              <Input
                value={item.alt}
                placeholder="Aciklama"
                onChange={(e) =>
                  setGallery((prev) => prev.map((g, i) => (i === index ? { ...g, alt: e.target.value } : g)))
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() => setGallery((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setGallery((prev) => [...prev, { src: "", alt: "" }])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Gorsel Ekle
            </Button>
            <Button
              disabled={galleryLoading}
              onClick={() =>
                save(
                  { [SETTING_KEYS.contentGallery]: JSON.stringify(gallery) },
                  setGalleryLoading,
                  setGalleryMsg
                )
              }
            >
              {galleryLoading ? "Kaydediliyor..." : "Galeriyi Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer regions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Hizmet Bolgeleri
          </CardTitle>
          <CardDescription>Footer'da listelenen bolgeler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {regionsMsg && <Alert type={regionsMsg.type} message={regionsMsg.text} />}
          {regions.map((region, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={region}
                onChange={(e) =>
                  setRegions((prev) => prev.map((r, i) => (i === index ? e.target.value : r)))
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() => setRegions((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setRegions((prev) => [...prev, ""])}>
              <Plus className="w-4 h-4 mr-2" />
              Bolge Ekle
            </Button>
            <Button
              disabled={regionsLoading}
              onClick={() =>
                save(
                  {
                    [SETTING_KEYS.contentFooterRegions]: JSON.stringify(
                      regions.map((r) => r.trim()).filter(Boolean)
                    ),
                  },
                  setRegionsLoading,
                  setRegionsMsg
                )
              }
            >
              {regionsLoading ? "Kaydediliyor..." : "Bolgeleri Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
