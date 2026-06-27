"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Settings, Globe, CreditCard, Bell, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SETTING_KEYS } from "@/lib/settings-utils"
import { locales, localeNames, defaultLocale, type Locale } from "@/i18n/config"

type AdminUser = {
  id: number
  email: string
  name: string
  role: string
}

type SettingsMap = Record<string, string>

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

export default function SettingsPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [companyName, setCompanyName] = useState("")
  const [sitePhone, setSitePhone] = useState("")
  const [siteEmail, setSiteEmail] = useState("")
  const [siteAddress, setSiteAddress] = useState("")
  const [generalLoading, setGeneralLoading] = useState(false)
  const [generalMsg, setGeneralMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [enabledLocales, setEnabledLocales] = useState<Locale[]>([defaultLocale])
  const [langLoading, setLangLoading] = useState(false)
  const [langMsg, setLangMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [paymentCash, setPaymentCash] = useState(true)
  const [paymentOnline, setPaymentOnline] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMsg, setPaymentMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [notifyBooking, setNotifyBooking] = useState(true)
  const [notifyDriver, setNotifyDriver] = useState(true)
  const [notifyContact, setNotifyContact] = useState(true)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifyMsg, setNotifyMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const applySettings = useCallback((settings: SettingsMap) => {
    setCompanyName(settings[SETTING_KEYS.companyName] || "")
    setSitePhone(settings[SETTING_KEYS.sitePhone] || "")
    setSiteEmail(settings[SETTING_KEYS.siteEmail] || "")
    setSiteAddress(settings[SETTING_KEYS.siteAddress] || "")

    try {
      const parsed = JSON.parse(settings[SETTING_KEYS.enabledLocales] || '["tr"]') as Locale[]
      const valid = parsed.filter((l) => locales.includes(l))
      setEnabledLocales(valid.includes(defaultLocale) ? valid : [defaultLocale, ...valid])
    } catch {
      setEnabledLocales([defaultLocale])
    }

    setPaymentCash(settings[SETTING_KEYS.paymentCashEnabled] !== "false")
    setPaymentOnline(settings[SETTING_KEYS.paymentOnlineEnabled] === "true")
    setNotifyBooking(settings[SETTING_KEYS.notifyBooking] !== "false")
    setNotifyDriver(settings[SETTING_KEYS.notifyDriverApplication] !== "false")
    setNotifyContact(settings[SETTING_KEYS.notifyContact] !== "false")
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_user")
      if (!stored) {
        router.replace("/admin/login")
        return
      }
      setAdminUser(JSON.parse(stored))
    } catch {
      router.replace("/admin/login")
    }
  }, [router])

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) applySettings(data.settings)
      })
      .catch(() => setGeneralMsg({ type: "error", text: "Ayarlar yüklenemedi" }))
      .finally(() => setLoading(false))
  }, [applySettings])

  async function saveSettings(
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
      if (data.settings) applySettings(data.settings)
      setMsg({ type: "success", text: data.message || "Kaydedildi" })
    } catch {
      setMsg({ type: "error", text: "Bir hata oluştu" })
    } finally {
      setBusy(false)
    }
  }

  function toggleLocale(locale: Locale, checked: boolean) {
    if (locale === defaultLocale) return
    setEnabledLocales((prev) => {
      if (checked) return prev.includes(locale) ? prev : [...prev, locale]
      return prev.filter((l) => l !== locale)
    })
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)

    if (!adminUser?.email) {
      setPasswordMsg({ type: "error", text: "Oturum bulunamadı" })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Yeni şifreler eşleşmiyor" })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Yeni şifre en az 6 karakter olmalı" })
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          email: adminUser.email,
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error || "Şifre değiştirilemedi" })
        return
      }
      setPasswordMsg({ type: "success", text: "Şifreniz güncellendi" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPasswordMsg({ type: "error", text: "Bir hata oluştu" })
    } finally {
      setPasswordLoading(false)
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
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarlarini yonetin</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Genel Ayarlar
            </CardTitle>
            <CardDescription>Site iletisim bilgileri (footer ve iletisim sayfasinda gosterilir)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generalMsg && <Alert type={generalMsg.type} message={generalMsg.text} />}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Sirket Adi</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" value={sitePhone} onChange={(e) => setSitePhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteEmail">E-posta</Label>
                <Input id="siteEmail" type="email" value={siteEmail} onChange={(e) => setSiteEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input id="address" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} />
              </div>
            </div>
            <Button
              type="button"
              disabled={generalLoading}
              onClick={() =>
                saveSettings(
                  {
                    [SETTING_KEYS.companyName]: companyName.trim(),
                    [SETTING_KEYS.sitePhone]: sitePhone.trim(),
                    [SETTING_KEYS.siteEmail]: siteEmail.trim(),
                    [SETTING_KEYS.siteAddress]: siteAddress.trim(),
                    [SETTING_KEYS.siteWhatsapp]: sitePhone.replace(/\D/g, "").replace(/^0/, "90"),
                  },
                  setGeneralLoading,
                  setGeneralMsg
                )
              }
            >
              {generalLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Dil Ayarlari
            </CardTitle>
            <CardDescription>Sitede gosterilecek diller (Turkce her zaman acik)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {langMsg && <Alert type={langMsg.type} message={langMsg.text} />}
            <div className="space-y-4">
              {locales.map((locale) => (
                <div key={locale} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{localeNames[locale]}</p>
                    <p className="text-sm text-muted-foreground">
                      {locale === defaultLocale ? "Varsayilan dil" : locale.toUpperCase()}
                    </p>
                  </div>
                  <Switch
                    checked={enabledLocales.includes(locale)}
                    disabled={locale === defaultLocale}
                    onCheckedChange={(checked) => toggleLocale(locale, checked)}
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              disabled={langLoading}
              onClick={() =>
                saveSettings(
                  { [SETTING_KEYS.enabledLocales]: JSON.stringify(enabledLocales) },
                  setLangLoading,
                  setLangMsg
                )
              }
            >
              {langLoading ? "Kaydediliyor..." : "Dilleri Kaydet"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Odeme Ayarlari
            </CardTitle>
            <CardDescription>Rezervasyonda kabul edilen odeme yontemleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMsg && <Alert type={paymentMsg.type} message={paymentMsg.text} />}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nakit / Havale</p>
                  <p className="text-sm text-muted-foreground">Arac icerisinde veya transfer ile odeme</p>
                </div>
                <Switch checked={paymentCash} onCheckedChange={setPaymentCash} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Online Odeme</p>
                  <p className="text-sm text-muted-foreground">Kredi karti entegrasyonu (yakinda)</p>
                </div>
                <Switch checked={paymentOnline} onCheckedChange={setPaymentOnline} disabled />
              </div>
            </div>
            <Button
              type="button"
              disabled={paymentLoading}
              onClick={() =>
                saveSettings(
                  {
                    [SETTING_KEYS.paymentCashEnabled]: paymentCash ? "true" : "false",
                    [SETTING_KEYS.paymentOnlineEnabled]: paymentOnline ? "true" : "false",
                  },
                  setPaymentLoading,
                  setPaymentMsg
                )
              }
            >
              {paymentLoading ? "Kaydediliyor..." : "Odeme Ayarlarini Kaydet"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirim Ayarlari
            </CardTitle>
            <CardDescription>
              Yeni kayitlarda admin e-postasina bildirim (simdi log; SMTP sonra eklenebilir)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifyMsg && <Alert type={notifyMsg.type} message={notifyMsg.text} />}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yeni Rezervasyon</p>
                  <p className="text-sm text-muted-foreground">{siteEmail || "Admin e-postasi"}</p>
                </div>
                <Switch checked={notifyBooking} onCheckedChange={setNotifyBooking} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sofor Basvurusu</p>
                  <p className="text-sm text-muted-foreground">Yeni basvurularda bildirim</p>
                </div>
                <Switch checked={notifyDriver} onCheckedChange={setNotifyDriver} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Iletisim Formu</p>
                  <p className="text-sm text-muted-foreground">Yeni mesajlarda bildirim</p>
                </div>
                <Switch checked={notifyContact} onCheckedChange={setNotifyContact} />
              </div>
            </div>
            <Button
              type="button"
              disabled={notifyLoading}
              onClick={() =>
                saveSettings(
                  {
                    [SETTING_KEYS.notifyBooking]: notifyBooking ? "true" : "false",
                    [SETTING_KEYS.notifyDriverApplication]: notifyDriver ? "true" : "false",
                    [SETTING_KEYS.notifyContact]: notifyContact ? "true" : "false",
                  },
                  setNotifyLoading,
                  setNotifyMsg
                )
              }
            >
              {notifyLoading ? "Kaydediliyor..." : "Bildirimleri Kaydet"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Guvenlik Ayarlari
            </CardTitle>
            <CardDescription>
              {adminUser?.email ? `Hesap: ${adminUser.email}` : "Hesap guvenligi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordMsg && <Alert type={passwordMsg.type} message={passwordMsg.text} />}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="currentPassword">Mevcut Sifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Sifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Sifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Kaydediliyor..." : "Sifreyi Degistir"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
