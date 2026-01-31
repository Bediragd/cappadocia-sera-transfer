"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { contactSchema, type ContactFormData } from "@/lib/validations"

const contactInfo = [
  {
    icon: Phone,
    titleKey: "phone",
    content: "+90 500 123 45 67",
    href: "tel:+905001234567",
  },
  {
    icon: MessageCircle,
    titleKey: "whatsapp",
    content: "+90 500 123 45 67",
    href: "https://wa.me/905001234567",
  },
  {
    icon: Mail,
    titleKey: "email",
    content: "info@cappadociaseratransfer.com",
    href: "mailto:info@cappadociaseratransfer.com",
  },
  {
    icon: MapPin,
    titleKey: "address",
    content: "Goreme, Nevsehir, Turkiye",
    href: "https://maps.google.com/?q=Goreme,Nevsehir,Turkey",
  },
]

export function Contact() {
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
        form.reset()
      }
    } catch (error) {
      console.error("Contact form error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="iletisim" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">{t("contact.title")}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("contact.subtitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sorulariniz icin 7/24 hizmetinizdeyiz. WhatsApp veya telefon ile aninda ulasin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{info.titleKey}</h3>
                <a
                  href={info.href}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {info.content}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card>
            <CardContent className="p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("contact.successMessage")}</h3>
                  <p className="text-muted-foreground mb-4">En kisa surede size donecegiz.</p>
                  <Button onClick={() => setIsSubmitted(false)}>Yeni Mesaj Gonder</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.name")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Adiniz Soyadiniz" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.email")}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="ornek@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.phone")}</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+90 5XX XXX XX XX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.subject")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Mesaj konusu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.message")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mesajinizi yazin..."
                              className="resize-none min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gonderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t("contact.send")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-secondary/50 rounded-2xl p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{t("contact.everyday")}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t("hero.bookNow")}</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            WhatsApp uzerinden hizlica iletisime gecin veya formumuzu doldurun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="https://wa.me/905001234567" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("hero.whatsapp")}
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+905001234567">
                <Phone className="w-5 h-5 mr-2" />
                {t("hero.callUs")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
