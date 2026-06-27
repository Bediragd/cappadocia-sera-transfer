export function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export type PushPermissionState = 'unsupported' | 'denied' | 'granted' | 'default'

export function getPushSupport(): PushPermissionState {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission as PushPermissionState
}

export async function subscribeToPush(): Promise<{ ok: boolean; error?: string }> {
  const support = getPushSupport()
  if (support === 'unsupported') {
    return { ok: false, error: 'Tarayiciniz push bildirimlerini desteklemiyor.' }
  }

  const vapidRes = await fetch('/api/push/vapid')
  if (!vapidRes.ok) {
    return { ok: false, error: 'Push yapilandirmasi bulunamadi.' }
  }

  const { publicKey, enabled } = await vapidRes.json()
  if (!enabled || !publicKey) {
    return { ok: false, error: 'Sunucuda VAPID anahtarlari tanimli degil.' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { ok: false, error: 'Bildirim izni verilmedi.' }
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }

  const saveRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  })

  if (!saveRes.ok) {
    const data = await saveRes.json().catch(() => ({}))
    return { ok: false, error: data.error || 'Abonelik kaydedilemedi.' }
  }

  return { ok: true }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => {})
    await subscription.unsubscribe()
  }
}

export async function syncPushSubscription(): Promise<void> {
  const support = getPushSupport()
  if (support !== 'granted') return

  const vapidRes = await fetch('/api/push/vapid')
  if (!vapidRes.ok) return

  const { publicKey, enabled } = await vapidRes.json()
  if (!enabled || !publicKey) return

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  }).catch(() => {})
}
