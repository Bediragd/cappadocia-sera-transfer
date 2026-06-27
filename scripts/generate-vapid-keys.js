/**
 * VAPID anahtarlarini uretir (.env dosyasina ekleyin).
 * Harici bagimlilik yok — sunucuda dogrudan calisir.
 *
 * Kullanim: node scripts/generate-vapid-keys.js
 */
const crypto = require('crypto')

function urlBase64(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const curve = crypto.createECDH('prime256v1')
curve.generateKeys()

const publicKey = urlBase64(curve.getPublicKey())
const privateKey = urlBase64(curve.getPrivateKey())

console.log('Asagidaki satirlari .env dosyaniza ekleyin:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${privateKey}`)
console.log('VAPID_SUBJECT=mailto:info@cappadociaseratransfer.com')
