"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X, Car, FileText, Shield, Brain, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface FileUpload {
  file: File | null
  preview: string | null
}

interface FormData {
  // Kişisel Bilgiler
  adSoyad: string
  telefon: string
  email: string
  tcKimlik: string

  // Araç Bilgileri
  plaka: string
  aracMarka: string
  aracModel: string
  aracYil: string

  // Belgeler
  ehliyetOn: FileUpload
  ehliyetArka: FileUpload
  aracOn: FileUpload
  aracArka: FileUpload
  aracSag: FileUpload
  aracSol: FileUpload
  aracIc: FileUpload
  srcBelgesi: FileUpload
  adliSicil: FileUpload
  psikoteknik: FileUpload

  // KVKK
  kvkkOnay: boolean
}

const initialFormData: FormData = {
  adSoyad: "",
  telefon: "",
  email: "",
  tcKimlik: "",
  plaka: "",
  aracMarka: "",
  aracModel: "",
  aracYil: "",
  ehliyetOn: { file: null, preview: null },
  ehliyetArka: { file: null, preview: null },
  aracOn: { file: null, preview: null },
  aracArka: { file: null, preview: null },
  aracSag: { file: null, preview: null },
  aracSol: { file: null, preview: null },
  aracIc: { file: null, preview: null },
  srcBelgesi: { file: null, preview: null },
  adliSicil: { file: null, preview: null },
  psikoteknik: { file: null, preview: null },
  kvkkOnay: false,
}

export default function SoforBasvuruPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [kvkkDialogOpen, setKvkkDialogOpen] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: keyof FormData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        [field]: { file, preview },
      }))
    }
  }

  const removeFile = (field: keyof FormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { file: null, preview: null },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simüle edilmiş form gönderimi - gerçek uygulamada API'ye gönderilecek
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const FileUploadField = ({
    label,
    field,
    icon: Icon,
    description,
  }: {
    label: string
    field: keyof FormData
    icon: React.ElementType
    description?: string
  }) => {
    const upload = formData[field] as FileUpload

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}

        {upload.preview ? (
          <div className="relative group">
            <img
              src={upload.preview || "/placeholder.svg"}
              alt={label}
              className="w-full h-32 object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Icon className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Yüklemek için tıklayın</p>
            </div>
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(field, e)} />
          </label>
        )}
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Başvurunuz Alındı!</h1>
              <p className="text-muted-foreground mb-6">
                Başvurunuz başarıyla gönderildi. Belgeleriniz incelendikten sonra size e-posta ve telefon yoluyla bilgi
                verilecektir. Onay sürecinin ardından rezervasyon sisteminde görünmeye başlayacaksınız.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-sm text-left text-muted-foreground">
                    Başvuru değerlendirme süreci genellikle 2-3 iş günü içinde tamamlanır. Eksik veya hatalı belge
                    durumunda sizinle iletişime geçilecektir.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/">Ana Sayfaya Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfa</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-foreground">Cappadocia Sera Transfer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Şoför Başvuru Formu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cappadocia Sera Transfer ailesine katılmak için aşağıdaki formu eksiksiz doldurun. Başvurunuz onaylandıktan
            sonra rezervasyon sistemimizde görünmeye başlayacaksınız.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            {/* Kişisel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Kişisel Bilgiler
                </CardTitle>
                <CardDescription>Kimlik ve iletişim bilgilerinizi girin</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adSoyad">Ad Soyad *</Label>
                  <Input
                    id="adSoyad"
                    value={formData.adSoyad}
                    onChange={(e) => handleInputChange("adSoyad", e.target.value)}
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tcKimlik">T.C. Kimlik No *</Label>
                  <Input
                    id="tcKimlik"
                    value={formData.tcKimlik}
                    onChange={(e) => handleInputChange("tcKimlik", e.target.value)}
                    placeholder="12345678901"
                    maxLength={11}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon *</Label>
                  <Input
                    id="telefon"
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => handleInputChange("telefon", e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ehliyet Belgeleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Ehliyet Belgeleri
                </CardTitle>
                <CardDescription>Ehliyetinizin ön ve arka yüzünü yükleyin</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadField label="Ehliyet Ön Yüz *" field="ehliyetOn" icon={Upload} />
                <FileUploadField label="Ehliyet Arka Yüz *" field="ehliyetArka" icon={Upload} />
              </CardContent>
            </Card>

            {/* Araç Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Araç Bilgileri
                </CardTitle>
                <CardDescription>Kullanacağınız aracın bilgilerini girin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plaka">Plaka *</Label>
                    <Input
                      id="plaka"
                      value={formData.plaka}
                      onChange={(e) => handleInputChange("plaka", e.target.value.toUpperCase())}
                      placeholder="50 ABC 123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aracMarka">Marka *</Label>
                    <Input
                      id="aracMarka"
                      value={formData.aracMarka}
                      onChange={(e) => handleInputChange("aracMarka", e.target.value)}
                      placeholder="Mercedes"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aracModel">Model *</Label>
                    <Input
                      id="aracModel"
                      value={formData.aracModel}
                      onChange={(e) => handleInputChange("aracModel", e.target.value)}
                      placeholder="Vito"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aracYil">Yıl *</Label>
                    <Input
                      id="aracYil"
                      value={formData.aracYil}
                      onChange={(e) => handleInputChange("aracYil", e.target.value)}
                      placeholder="2022"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4">Araç Fotoğrafları *</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <FileUploadField label="Ön" field="aracOn" icon={Car} />
                    <FileUploadField label="Arka" field="aracArka" icon={Car} />
                    <FileUploadField label="Sağ Yan" field="aracSag" icon={Car} />
                    <FileUploadField label="Sol Yan" field="aracSol" icon={Car} />
                    <FileUploadField label="İç Mekan" field="aracIc" icon={Car} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resmi Belgeler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Resmi Belgeler
                </CardTitle>
                <CardDescription>Zorunlu belgeleri yükleyin</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FileUploadField
                  label="SRC Belgesi *"
                  field="srcBelgesi"
                  icon={FileText}
                  description="Yolcu taşımacılığı yetki belgesi"
                />
                <FileUploadField
                  label="Adli Sicil Kaydı *"
                  field="adliSicil"
                  icon={Shield}
                  description="e-Devlet üzerinden alınmış"
                />
                <FileUploadField
                  label="Psikoteknik Belgesi *"
                  field="psikoteknik"
                  icon={Brain}
                  description="e-Devlet üzerinden alınmış"
                />
              </CardContent>
            </Card>

            {/* KVKK Onayı */}
            <Card>
              <CardHeader>
                <CardTitle>KVKK Aydınlatma Metni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="kvkk"
                    checked={formData.kvkkOnay}
                    onCheckedChange={(checked) => handleInputChange("kvkkOnay", checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="kvkk" className="text-sm text-muted-foreground cursor-pointer">
                      <Dialog open={kvkkDialogOpen} onOpenChange={setKvkkDialogOpen}>
                        <DialogTrigger asChild>
                          <span className="text-primary hover:underline cursor-pointer">KVKK Aydınlatma Metni</span>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>KVKK Aydınlatma Metni</DialogTitle>
                            <DialogDescription>
                              Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                              <strong>1. Veri Sorumlusu</strong>
                              <br />
                              Cappadocia Sera Transfer olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
                              veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz.
                            </p>
                            <p>
                              <strong>2. İşlenen Kişisel Veriler</strong>
                              <br />
                              Şoför başvuru sürecinde aşağıdaki kişisel verileriniz işlenmektedir:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Kimlik bilgileri (Ad, soyad, T.C. kimlik numarası)</li>
                              <li>İletişim bilgileri (Telefon, e-posta adresi)</li>
                              <li>Ehliyet bilgileri ve görselleri</li>
                              <li>Araç bilgileri ve görselleri</li>
                              <li>SRC belgesi</li>
                              <li>Adli sicil kaydı</li>
                              <li>Psikoteknik raporu</li>
                            </ul>
                            <p>
                              <strong>3. Kişisel Verilerin İşlenme Amaçları</strong>
                              <br />
                              Toplanan kişisel verileriniz; şoför başvurunuzun değerlendirilmesi, yasal yükümlülüklerin
                              yerine getirilmesi, iş sözleşmesinin kurulması ve ifası, güvenli ulaşım hizmetinin
                              sağlanması amaçlarıyla işlenmektedir.
                            </p>
                            <p>
                              <strong>4. Kişisel Verilerin Aktarılması</strong>
                              <br />
                              Kişisel verileriniz, yasal zorunluluklar çerçevesinde kamu kurum ve kuruluşlarına, iş
                              ortaklarımıza ve hizmet aldığımız üçüncü taraflara aktarılabilecektir.
                            </p>
                            <p>
                              <strong>5. Kişisel Verilerin Toplanma Yöntemi</strong>
                              <br />
                              Kişisel verileriniz, bu başvuru formu aracılığıyla elektronik ortamda toplanmaktadır.
                            </p>
                            <p>
                              <strong>6. Veri Sahibinin Hakları</strong>
                              <br />
                              KVKK&apos;nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme,
                              işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve bunların amacına uygun
                              kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü
                              kişileri bilme, eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme,
                              silinmesini veya yok edilmesini isteme haklarına sahipsiniz.
                            </p>
                            <p>
                              <strong>7. İletişim</strong>
                              <br />
                              KVKK kapsamındaki taleplerinizi info@cappadociaseratransfer.com adresine iletebilirsiniz.
                            </p>
                          </div>
                          <Button onClick={() => setKvkkDialogOpen(false)} className="mt-4">
                            Anladım
                          </Button>
                        </DialogContent>
                      </Dialog>
                      &apos;ni okudum ve kişisel verilerimin belirtilen amaçlarla işlenmesini kabul ediyorum. *
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-12"
                disabled={!formData.kvkkOnay || isSubmitting}
              >
                {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </Button>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Başvurunuz incelendikten sonra sonuç e-posta ve telefon ile bildirilecektir. Onay sonrası rezervasyon
                sisteminde görünmeye başlayacaksınız.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
