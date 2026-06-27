"use client"

import { useEffect } from "react"
import { syncPushSubscription } from "@/lib/push-client"

/** Izin zaten verildiyse aboneligi sessizce senkronize eder. */
export function AdminPushNotifications() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window) || Notification.permission !== "granted") return

    syncPushSubscription().catch(() => {})
  }, [])

  return null
}
