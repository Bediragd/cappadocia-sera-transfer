"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageCircle, Trash2, Save, Star } from "lucide-react"

type QaItem = {
  id: number
  username: string
  question: string
  answer: string | null
  rating: number | null
  created_at: string
  answered_at: string | null
}

export default function AdminQuestionsPage() {
  const [items, setItems] = useState<QaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch("/api/qa?all=1&limit=100", { cache: "no-store" })
      const data = await res.json()
      setItems(data.questions || [])
    } catch (e) {
      console.error("Admin QA fetch error", e)
    } finally {
      setLoading(false)
    }
  }

  function updateLocal(id: number, changes: Partial<QaItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  async function handleSave(item: QaItem) {
    setSavingId(item.id)
    try {
      await fetch(`/api/qa/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: item.answer,
          rating: item.rating,
        }),
      })
      await fetchItems()
    } catch (e) {
      console.error("QA save error", e)
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return
    setDeletingId(id)
    try {
      await fetch(`/api/qa/${id}`, { method: "DELETE" })
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (e) {
      console.error("QA delete error", e)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Soru &amp; Cevap</h1>
        <p className="text-muted-foreground">
          Kullanıcıların sorduğu soruları görüntüleyin, cevaplayın, puan verin ve gerekirse silin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Sorular ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz soru bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-border bg-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Soru:</span>{" "}
                    <span>{item.question}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      Cevap
                    </label>
                    <Textarea
                      value={item.answer || ""}
                      onChange={(e) => updateLocal(item.id, { answer: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
                    <label className="text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      Puan (1-5)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      className="w-24"
                      value={item.rating ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        const num = val === "" ? null : Math.max(1, Math.min(5, Number(val)))
                        updateLocal(item.id, { rating: num as number | null })
                      }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleSave(item)}
                      disabled={savingId === item.id}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {savingId === item.id ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

