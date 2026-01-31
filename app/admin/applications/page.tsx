"use client"

import { useEffect, useState } from "react"
import { UserPlus, Mail, Phone, Calendar, Car, MapPin, Check, X, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Application {
  id: number
  full_name: string
  email: string
  phone: string
  experience_years: number
  license_number: string
  own_vehicle: boolean
  vehicle_type: string | null
  city: string
  address: string
  notes: string | null
  status: string
  created_at: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewingApplication, setReviewingApplication] = useState<Application | null>(null)
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

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

  function openReviewDialog(application: Application, action: "approved" | "rejected") {
    setReviewingApplication(application)
    setActionType(action)
    setAdminNotes(application.notes || "")
  }

  async function handleReview() {
    if (!reviewingApplication || !actionType) return

    try {
      await fetch(`/api/driver-applications/${reviewingApplication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          notes: adminNotes,
        }),
      })
      setReviewingApplication(null)
      setActionType(null)
      setAdminNotes("")
      fetchApplications()
    } catch (error) {
      console.error("Failed to update application:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      inactive: "outline",
    }
    const labels: Record<string, string> = {
      pending: "Bekliyor",
      approved: "Onaylandı",
      rejected: "Reddedildi",
      inactive: "Pasif",
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
        <h1 className="text-2xl font-bold text-foreground">Şoför Başvuruları</h1>
        <p className="text-muted-foreground">Yeni şoför başvurularını inceleyin ve onaylayın</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Başvuru Listesi ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henüz başvuru yok</p>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{application.full_name}</h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {application.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {application.phone}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {application.experience_years} yıl tecrübe • {application.city}
                        {application.own_vehicle && ` • Kendi aracı var (${application.vehicle_type})`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {application.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600"
                            onClick={() => openReviewDialog(application, "approved")}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-600"
                            onClick={() => openReviewDialog(application, "rejected")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
            <DialogTitle>Başvuru Detayı</DialogTitle>
            <DialogDescription>{selectedApplication?.full_name}</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">E-posta</p>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Şehir</p>
                  <p className="font-medium">{selectedApplication.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tecrübe</p>
                  <p className="font-medium">{selectedApplication.experience_years} yıl</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ehliyet No</p>
                  <p className="font-medium">{selectedApplication.license_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kendi Aracı</p>
                  <p className="font-medium">{selectedApplication.own_vehicle ? "Evet" : "Hayır"}</p>
                </div>
                {selectedApplication.own_vehicle && (
                  <div>
                    <p className="text-sm text-muted-foreground">Araç Tipi</p>
                    <p className="font-medium">{selectedApplication.vehicle_type || "-"}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Adres</p>
                  <p className="font-medium">{selectedApplication.address || "-"}</p>
                </div>
                {selectedApplication.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Admin Notları</p>
                    <p className="font-medium">{selectedApplication.notes}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Durum</p>
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>
              {selectedApplication.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedApplication(null)
                      openReviewDialog(selectedApplication, "rejected")
                    }}
                    className="text-rose-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reddet
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedApplication(null)
                      openReviewDialog(selectedApplication, "approved")
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Onayla
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <AlertDialog open={!!reviewingApplication} onOpenChange={() => setReviewingApplication(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Başvuruyu {actionType === "approved" ? "Onayla" : "Reddet"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewingApplication?.full_name} adlı kişinin başvurusunu {actionType === "approved" ? "onaylamak" : "reddetmek"} üzeresiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Admin Notları (Opsiyonel)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Bu karar için bir not ekleyin..."
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReview}
              className={actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}
            >
              {actionType === "approved" ? "Onayla" : "Reddet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
