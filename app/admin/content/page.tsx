"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Share2, Image as ImageIcon, MapPin, Plus, Trash2, Languages, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  SETTING_KEYS,
  DEFAULT_GALLERY,
  DEFAULT_FOOTER_REGIONS,
  parseJsonSetting,
  type GalleryItem,
} from "@/lib/settings-utils"

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

  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryMsg, setGalleryMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [regions, setRegions] = useState<string[]>(DEFAULT_FOOTER_REGIONS)
  const [regionsLoading, setRegionsLoading] = useState(false)
  const [regionsMsg, setRegionsMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [siteLogo, setSiteLogo] = useState("/logo.png")
  const [siteFavicon, setSiteFavicon] = useState("/logo.png")
  const [brandLoading, setBrandLoading] = useState(false)
  const [brandMsg, setBrandMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [brandVersion, setBrandVersion] = useState(0)

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
        setGallery(parseJsonSetting<GalleryItem[]>(s[SETTING_KEYS.contentGallery], DEFAULT_GALLERY))
        setRegions(parseJsonSetting<string[]>(s[SETTING_KEYS.contentFooterRegions], DEFAULT_FOOTER_REGIONS))
        setSiteLogo(s[SETTING_KEYS.siteLogo] || "/logo.png")
        setSiteFavicon(s[SETTING_KEYS.siteFavicon] || "/logo.png")
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

  async function uploadBranding(file: File, type: "logo" | "favicon") {
    setBrandLoading(true)
    setBrandMsg(null)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("type", type)
      const res = await fetch("/api/upload/branding", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) {
        setBrandMsg({ type: "error", text: data.error || "Yukleme basarisiz" })
        return
      }
      if (data.site_logo) setSiteLogo(data.site_logo)
      if (data.site_favicon) setSiteFavicon(data.site_favicon)
      setBrandVersion((v) => v + 1)
      setBrandMsg({ type: "success", text: data.message || "Yuklendi" })
    } catch {
      setBrandMsg({ type: "error", text: "Yukleme sirasinda hata olustu" })
    } finally {
      setBrandLoading(false)
    }
  }

  async function faviconFromLogo() {
    setBrandLoading(true)
    setBrandMsg(null)
    try {
      const form = new FormData()
      form.append("type", "from-logo")
      form.append("logoPath", siteLogo)
      const res = await fetch("/api/upload/branding", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) {
        setBrandMsg({ type: "error", text: data.error || "Favicon olusturulamadi" })
        return
      }
      if (data.site_favicon) setSiteFavicon(data.site_favicon)
      setBrandVersion((v) => v + 1)
      setBrandMsg({ type: "success", text: data.message || "Favicon olusturuldu" })
    } catch {
      setBrandMsg({ type: "error", text: "Islem basarisiz" })
    } finally {
      setBrandLoading(false)
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

      {/* Logo & Favicon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Logo ve Site Ikonu (Favicon)
          </CardTitle>
          <CardDescription>
            Varsayilan: /logo.png. Logo yuklenince favicon otomatik olusturulur (32, 180, 192 px).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandMsg && <Alert type={brandMsg.type} message={brandMsg.text} />}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <p className="font-medium text-sm">Site Logosu</p>
              <p className="text-xs text-muted-foreground">Onerilen: kare, en az 256x256 px, max 2 MB</p>
              <div className="flex items-center gap-4">
                <img
                  src={`${siteLogo}${siteLogo.includes("?") ? "&" : "?"}v=${brandVersion}`}
                  alt="Logo"
                  className="w-16 h-16 rounded-full object-cover border border-border"
                />
                <div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={brandLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) uploadBranding(f, "logo")
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={brandLoading}
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    {brandLoading ? "Yukleniyor..." : "Logo Yukle"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <p className="font-medium text-sm">Mini Ikon (Favicon)</p>
              <p className="text-xs text-muted-foreground">Sekme ikonu: 32x32 | Apple: 180x180 (otomatik)</p>
              <div className="flex items-center gap-4">
                <img
                  src={`${siteFavicon}${siteFavicon.includes("?") ? "&" : "?"}v=${brandVersion}`}
                  alt="Favicon"
                  className="w-10 h-10 rounded object-cover border border-border"
                />
                <div className="flex flex-col gap-2">
                  <input
                    id="favicon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={brandLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) uploadBranding(f, "favicon")
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={brandLoading}
                    onClick={() => document.getElementById("favicon-upload")?.click()}
                  >
                    Ikon Yukle
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={brandLoading}
                    onClick={faviconFromLogo}
                  >
                    Logodan Ikon Olustur
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Services (i18n) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Hizmetler
          </CardTitle>
          <CardDescription>Ana sayfadaki hizmet kartlari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 text-sm text-muted-foreground bg-muted/40 border border-border rounded-md">
            Hizmet kartlari artik cok dilli ceviri dosyalarindan
            (<code>i18n/messages/*.json</code> &rarr; <code>services</code>) yonetilmektedir.
            Boylece her dil icin otomatik olarak dogru metin gosterilir. Metni guncellemek
            icin ilgili dil dosyalarindaki <code>services</code> bolumunu duzenleyin.
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
