/**
 * VAPID anahtarlarini uretir (.env dosyasina ekleyin).
 * Kullanim: node scripts/generate-vapid-keys.js
 */
const webpush = require('web-push')

const keys = webpush.generateVAPIDKeys()

console.log('Asagidaki satirlari .env dosyaniza ekleyin:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log('VAPID_SUBJECT=mailto:info@cappadociaseratransfer.com')
