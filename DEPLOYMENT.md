# 🚀 Deployment Rehberi - Cappadocia Sera Transfer

## 📋 Ön Hazırlık

### 1. Projeyi Production için Hazırlayın

```bash
# Test edin
npm run build
npm start

# Hataları düzeltin
npm run lint
```

### 2. Environment Variables
Aşağıdaki değişkenleri deployment platformunda ayarlayın:

```env
DATABASE_URL=your_neon_postgres_connection_string
NODE_ENV=production
```

---

## ⭐ YÖNTEM 1: Vercel Deploy (ÖNERİLEN - EN KOLAY)

### Adımlar:

#### 1. GitHub'a Push
```bash
# Henüz Git repo yoksa
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluşturun sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/cappadocia-sera-transfer.git
git branch -M main
git push -u origin main
```

#### 2. Vercel'e Deploy
1. **Hesap oluşturun**: https://vercel.com/signup
2. **New Project** → **Import Git Repository**
3. GitHub repo'nuzu seçin
4. **Environment Variables** ekleyin:
   - `DATABASE_URL` → Neon connection string'iniz
5. **Deploy** düğmesine basın

#### 3. Custom Domain Bağlayın
1. Vercel dashboard → **Settings** → **Domains**
2. Domain'inizi girin: `cappadociaseratransfer.com`
3. DNS ayarlarını domain sağlayıcınıza ekleyin:

**Natro/Turhost için**:
```
Tip: A       Host: @      Değer: 76.76.21.21
Tip: CNAME   Host: www    Değer: cname.vercel-dns.com
```

**Cloudflare için**:
```
Type: A      Name: @      Content: 76.76.21.21    Proxy: ✓
Type: CNAME  Name: www    Content: cname.vercel-dns.com   Proxy: ✓
```

#### 4. SSL Otomatik Aktif Olur
Vercel otomatik olarak Let's Encrypt SSL sertifikası ekler. ✅

#### 5. Her Git Push = Otomatik Deploy
Artık her `git push` ile siteniz otomatik güncellenecek!

---

## 🔶 YÖNTEM 2: Netlify Deploy

#### 1. GitHub'a Push
(Yukarıdaki adımların aynısı)

#### 2. Netlify'a Deploy
1. **Hesap oluşturun**: https://app.netlify.com/signup
2. **Add new site** → **Import an existing project**
3. GitHub repo'nuzu seçin
4. **Build settings**:
   ```
   Base directory: (boş bırakın)
   Build command: npm run build
   Publish directory: .next
   ```
5. **Environment Variables**:
   - `DATABASE_URL`
6. **Deploy site**

#### 3. Custom Domain
1. **Domain settings** → **Add custom domain**
2. DNS kayıtlarını ekleyin:
```
Type: A      Name: @      Value: 75.2.60.5
Type: CNAME  Name: www    Value: YOUR-SITE.netlify.app
```

---

## 🖥️ YÖNTEM 3: VPS (Ubuntu Sunucu)

### Gereksinimler:
- Ubuntu 22.04 sunucu (DigitalOcean, Vultr, AWS)
- Domain (A kaydı sunucu IP'sine yönlendirilmiş)

### 1. Sunucu Kurulumu

```bash
# Sunucuya SSH bağlanın
ssh root@YOUR_SERVER_IP

# Güncellemeleri yapın
apt update && apt upgrade -y

# Node.js 20 kurun
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 kurun (process manager)
npm install -g pm2 pnpm

# Nginx kurun
apt install -y nginx

# Certbot kurun (SSL için)
apt install -y certbot python3-certbot-nginx
```

### 2. Projeyi Deploy Edin

```bash
# Deploy kullanıcısı oluşturun
adduser deploy
usermod -aG sudo deploy
su - deploy

# Projeyi klonlayın
git clone https://github.com/KULLANICI_ADINIZ/cappadocia-sera-transfer.git
cd cappadocia-sera-transfer

# Bağımlılıkları yükleyin
pnpm install

# .env dosyası oluşturun
nano .env
# DATABASE_URL'i ekleyin, kaydedin (Ctrl+X, Y, Enter)

# Build edin
pnpm build

# PM2 ile başlatın
pm2 start npm --name "cappadocia-transfer" -- start
pm2 save
pm2 startup
```

### 3. Nginx Yapılandırması

```bash
# Nginx config oluşturun
sudo nano /etc/nginx/sites-available/cappadocia
```

Aşağıdaki içeriği yapıştırın:
```nginx
server {
    listen 80;
    server_name cappadociaseratransfer.com www.cappadociaseratransfer.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifleştirin:
```bash
sudo ln -s /etc/nginx/sites-available/cappadocia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Sertifikası (HTTPS)

```bash
sudo certbot --nginx -d cappadociaseratransfer.com -d www.cappadociaseratransfer.com
```

### 5. Güncelleme için

```bash
cd ~/cappadocia-sera-transfer
git pull
pnpm install
pnpm build
pm2 restart cappadocia-transfer
```

---

## 📊 Karşılaştırma Tablosu

| Özellik | Vercel | Netlify | VPS |
|---------|---------|---------|-----|
| **Kolay Kurulum** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Ücretsiz Plan** | ✅ Bol | ✅ Orta | ❌ ($5-10/ay) |
| **SSL** | ✅ Otomatik | ✅ Otomatik | 🔧 Manuel |
| **CDN** | ✅ Global | ✅ Global | ❌ |
| **Otomatik Deploy** | ✅ Git push | ✅ Git push | 🔧 Manuel |
| **Performans** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Özelleştirme** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Önerimiz

**Yeni başlıyorsanız**: **Vercel** kullanın
- 5 dakikada deploy
- Hiç teknik bilgi gerekmez
- Ücretsiz ve güçlü

**Uzun vadede daha ucuz**: **VPS** kullanın
- Tek sunucuda birden fazla proje
- Tam kontrol
- $5-10/ay sabit maliyet

---

## 🔐 Güvenlik Kontrol Listesi

Deploy sonrası kontrol edin:

- [ ] `.env` dosyası Git'e eklenmemiş (.gitignore'da)
- [ ] DATABASE_URL production ortamında ayarlanmış
- [ ] HTTPS çalışıyor (yeşil kilit)
- [ ] `www` ve `non-www` versiyonlar çalışıyor
- [ ] Tüm sayfalar yükleniyor
- [ ] Rezervasyon formu çalışıyor
- [ ] Admin paneli çalışıyor (/admin)
- [ ] Çoklu dil çalışıyor

---

## 🆘 Sorun Giderme

### Build hatası alıyorum
```bash
# Yerel olarak test edin
npm run build
# Hataları düzeltin, tekrar push edin
```

### Database bağlanamıyor
- Environment variables'da DATABASE_URL doğru mu?
- Neon'da IP whitelist var mı? (Tümüne izin verin)

### Domain bağlanmıyor
- DNS değişikliklerinin yayılması 1-48 saat sürebilir
- https://dnschecker.org ile kontrol edin

### 500 hatası alıyorum
- Deployment loglarını kontrol edin
- Vercel/Netlify dashboard → Logs

---

## 📞 Destek

Sorun yaşarsanız:
1. Deployment loglarını kontrol edin
2. Browser console'da hata var mı bakın (F12)
3. DATABASE_URL'in doğru olduğundan emin olun

**Başarılar!** 🚀
