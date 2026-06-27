"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("qa")
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
      setError(t("errorRequired"))
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
        setError(data.error || t("errorSubmit"))
        return
      }
      setMessage(t("success"))
      setQuestion("")
    } catch (e) {
      setError(t("errorSubmit"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="sorucevap" className="py-20 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t("title")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t("askTitle")}
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
                  <label className="text-sm font-medium">{t("nameLabel")}</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("questionLabel")}</label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={t("questionPlaceholder")}
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? t("submitting") : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("faqTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">{t("empty")}</p>
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
                        <span className="font-medium">{t("questionPrefix")}</span> {item.question}
                      </p>
                      {item.answer && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{t("answerPrefix")}</span> {item.answer}
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
