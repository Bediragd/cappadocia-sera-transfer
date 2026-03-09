"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle } from "lucide-react"

type QaItem = {
  id: number
  username: string
  question: string
  answer: string | null
  rating: number | null
  created_at: string
}

export function QASection() {
  const [items, setItems] = useState<QaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [question, setQuestion] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/qa?limit=20", { cache: "no-store" })
        const data = await res.json()
        setItems(data.questions || [])
      } catch (e) {
        console.error("QA fetch error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!username.trim() || !question.trim()) {
      setError("Kullanıcı adı ve soru zorunludur.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), question: question.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Soru gönderilemedi.")
        return
      }
      setMessage("Sorunuz alındı. En kısa sürede cevaplanacaktır.")
      setQuestion("")
    } catch (e) {
      setError("Soru gönderilirken bir hata oluştu.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="sorucevap" className="py-20 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Soru &amp; Cevap
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transfer, rezervasyon ve hizmetlerimizle ilgili merak ettiklerinizi bize sorabilirsiniz.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Soru Sor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                    {message}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kullanıcı Adı</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Görünecek isminiz"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sorunuz</label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Transfer, havalimanı, ödeme vb. ile ilgili sorunuzu yazın..."
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Gönderiliyor..." : "Soruyu Gönder"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sık Sorulan Sorular</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Henüz cevaplanmış soru bulunmuyor. İlk soruyu siz sorabilirsiniz.
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.username}
                        </span>
                        {item.rating != null && (
                          <div className="flex items-center gap-1 text-amber-500 text-xs">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{item.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mb-2">
                        <span className="font-medium">Soru:</span> {item.question}
                      </p>
                      {item.answer && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Cevap:</span> {item.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

