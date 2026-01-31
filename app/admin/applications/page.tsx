"use client"

import { useEffect, useState } from "react"
import { UserPlus, Mail, Phone, Calendar, Car, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Application {
  id: number
  name: string
  email: string
  phone: string
  experience_years: number
  license_type: string
  has_own_vehicle: boolean
  vehicle_type: string | null
  city: string
  message: string | null
  status: string
  created_at: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      const response = await fetch("/api/driver-applications")
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      reviewed: "outline",
      accepted: "default",
      rejected: "destructive",
    }
    const labels: Record<string, string> = {
      pending: "Bekliyor",
      reviewed: "Incelendi",
      accepted: "Kabul Edildi",
      rejected: "Reddedildi",
    }
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
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
        <h1 className="text-2xl font-bold text-foreground">Sofor Basvurulari</h1>
        <p className="text-muted-foreground">Yeni sofor basvurularini inceleyin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Basvuru Listesi ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henuz basvuru yok</p>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{application.name}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {application.experience_years} yil tecrube - {application.license_type} ehliyet
                      </p>
                      <p className="text-sm text-muted-foreground">{application.city}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(application.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Basvuru Detayi</DialogTitle>
            <DialogDescription>
              {selectedApplication?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApplication.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApplication.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApplication.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(selectedApplication.created_at).toLocaleString("tr-TR")}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Tecrube</p>
                  <p className="font-medium">{selectedApplication.experience_years} yil</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ehliyet Turu</p>
                  <p className="font-medium">{selectedApplication.license_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kendi Araci</p>
                  <p className="font-medium">{selectedApplication.has_own_vehicle ? "Evet" : "Hayir"}</p>
                </div>
                {selectedApplication.vehicle_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Arac Turu</p>
                    <p className="font-medium">{selectedApplication.vehicle_type}</p>
                  </div>
                )}
              </div>

              {selectedApplication.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ek Bilgiler</p>
                  <p className="p-4 rounded-lg bg-muted/50 text-foreground">
                    {selectedApplication.message}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                {getStatusBadge(selectedApplication.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
