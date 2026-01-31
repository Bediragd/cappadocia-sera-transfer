"use client"

import { Settings, Globe, CreditCard, Bell, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarlarini yonetin</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Genel Ayarlar
            </CardTitle>
            <CardDescription>Temel sistem ayarlari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Sirket Adi</Label>
                <Input id="companyName" defaultValue="Cappadocia Sera Transfer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" defaultValue="+90 500 123 45 67" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" defaultValue="info@seratransfer.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input id="address" defaultValue="Nevsehir, Turkiye" />
              </div>
            </div>
            <Button>Kaydet</Button>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Dil Ayarlari
            </CardTitle>
            <CardDescription>Desteklenen diller</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Turkce</p>
                  <p className="text-sm text-muted-foreground">Varsayilan dil</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">English</p>
                  <p className="text-sm text-muted-foreground">Ingilizce</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Русский</p>
                  <p className="text-sm text-muted-foreground">Rusca</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">हिन्दी</p>
                  <p className="text-sm text-muted-foreground">Hintce</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Odeme Ayarlari
            </CardTitle>
            <CardDescription>Odeme yontemleri ve entegrasyonlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">
                Odeme entegrasyonu yakilmda eklenecek
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirim Ayarlari
            </CardTitle>
            <CardDescription>E-posta ve SMS bildirimleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yeni Rezervasyon Bildirimi</p>
                  <p className="text-sm text-muted-foreground">Yeni rezervasyonlarda e-posta gonder</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sofor Basvuru Bildirimi</p>
                  <p className="text-sm text-muted-foreground">Yeni basvurularda bildirim</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Iletisim Formu Bildirimi</p>
                  <p className="text-sm text-muted-foreground">Yeni mesajlarda bildirim</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Guvenlik Ayarlari
            </CardTitle>
            <CardDescription>Hesap guvenligi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Sifre</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div />
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Sifre</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Sifre Tekrar</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>
            <Button>Sifreyi Degistir</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
