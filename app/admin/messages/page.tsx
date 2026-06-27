"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Mail, Phone, Calendar, Trash2, Reply } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface Message {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      const response = await fetch("/api/contact")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function openMessage(message: Message) {
    setSelectedMessage(message)
    if (!message.is_read) {
      try {
        await fetch(`/api/contact/${message.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        })
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
        )
      } catch (error) {
        console.error("Failed to mark message read:", error)
      }
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/contact/${id}`, { method: "DELETE" })
      setDeleteTarget(null)
      setSelectedMessage(null)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Failed to delete message:", error)
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mesajlar</h1>
        <p className="text-muted-foreground">Iletisim formundan gelen mesajlar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mesaj Listesi ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Henuz mesaj yok</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="space-y-1 flex-1 cursor-pointer"
                      onClick={() => openMessage(message)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{message.name}</h3>
                        {!message.is_read && (
                          <Badge variant="default" className="text-xs">Yeni</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(message.created_at).toLocaleDateString("tr-TR")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 h-8 w-8"
                        onClick={() => setDeleteTarget(message)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.name} tarafindan gonderildi
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {selectedMessage.email}
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {selectedMessage.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedMessage.created_at).toLocaleString("tr-TR")}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent("RE: " + selectedMessage.subject)}`}>
                    <Reply className="w-4 h-4 mr-2" />
                    E-posta ile Yanıtla
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="text-rose-600"
                  onClick={() => setDeleteTarget(selectedMessage)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mesajı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} adlı kişinin mesajını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
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
