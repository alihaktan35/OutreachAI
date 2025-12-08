# 📧 OutreachAI - Basit Demo Versiyonu

Bu, derste gösterim için hazırlanmış basitleştirilmiş versiyondur. Apollo entegrasyonu olmadan, sadece **CSV + AI + E-posta** ile çalışır.

---

## 🎯 Demo Özellikleri

✅ **CSV Yükleme** - Excel'den e-posta listesi
✅ **AI Kişiselleştirme** - Gemini AI ile her kişiye özel e-posta
✅ **E-posta Gönderimi** - Gmail SMTP veya SendGrid
✅ **Rate Limiting** - Spam önleme (3 saniye bekleme)
✅ **Web Arayüzü** - Basit HTML test sayfası

---

## 📁 Demo Dosyaları

```
OutreachAI/
├── 📄 QUICKSTART.md                          ← 10 dakikada kurulum
├── 📄 GMAIL_SETUP.md                         ← Gmail SMTP rehberi
├── 📄 SIMPLE_DEMO_SETUP.md                   ← Detaylı kurulum
├── 🌐 demo-csv-uploader.html                 ← Test arayüzü
├── 📊 contacts-template.csv                  ← Örnek CSV (GİTHUB'A YÜKLENMİYOR)
└── 📦 n8n-workflows/
    ├── simple-email-campaign.json            ← SendGrid versiyonu
    └── simple-email-campaign-gmail.json      ← Gmail SMTP versiyonu
```

---

## 🚀 Hızlı Başlangıç

### 1. Dosyaları İndirin

```bash
git clone https://github.com/alihaktan35/OutreachAI.git
cd OutreachAI
```

### 2. API Key'leri Alın

**Gemini AI (Zorunlu):**
- https://makersuite.google.com/app/apikey

**E-posta Sağlayıcısı (Birini Seçin):**
- **Gmail:** https://myaccount.google.com/apppasswords (Kolay - Önerilen)
- **SendGrid:** https://sendgrid.com/ (Profesyonel)

### 3. n8n'i Çalıştırın

**Gmail ile:**
```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="GEMINI_KEY_BURAYA" \
  -e GMAIL_USER="sizin-gmail@gmail.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**SendGrid ile:**
```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="GEMINI_KEY_BURAYA" \
  -e SENDGRID_API_KEY="SG.xxx" \
  -e SENDGRID_FROM_EMAIL="email@example.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 4. Workflow'u Import Edin

1. http://localhost:5678 açın
2. Workflows → Import from File
3. Gmail için: `n8n-workflows/simple-email-campaign-gmail.json`
4. SendGrid için: `n8n-workflows/simple-email-campaign.json`
5. Credentials ekleyin (detaylı talimatlar için QUICKSTART.md)
6. Workflow'u "Active" yapın

### 5. Test Edin

1. `demo-csv-uploader.html` dosyasını tarayıcıda açın
2. CSV yükleyin veya manuel yapıştırın
3. "Kampanya Başlat" butonuna tıklayın
4. E-posta kutunuzu kontrol edin!

---

## 📊 Workflow Akışı

```
CSV Upload (Web Arayüzü)
    ↓
Webhook (n8n)
    ↓
Parse CSV (JSON'a çevir)
    ↓
For Each Contact:
    ↓
    Prepare AI Prompt (Kişiye özel)
    ↓
    Gemini AI (E-posta oluştur)
    ↓
    Format Email (Konu + içerik)
    ↓
    Gmail/SendGrid (Gönder)
    ↓
    Wait 3 seconds (Rate limiting)
    ↓
Summary Response (Kaç e-posta gönderildi?)
```

---

## 🎓 Derste Gösterim Planı

1. **n8n Dashboard'u göster** (http://localhost:5678)
2. **Workflow'u açıkla** (her node'un işlevini)
3. **demo-csv-uploader.html'i aç**
4. **CSV içeriğini göster** (2-3 test e-postası)
5. **"Kampanya Başlat"a tıkla**
6. **n8n Execution'ı izle** (canlı çalışmasını göster)
7. **E-posta kutusunu aç** (AI'ın oluşturduğu içeriği göster)

---

## 📝 Örnek CSV

```csv
name,email,company,position,industry,notes
John Doe,john@example.com,TechCorp,CTO,Software,Interested in AI
Jane Smith,jane@startup.io,StartupIO,VP Engineering,Fintech,Looking for automation
Ali Yılmaz,sizin-gmail@gmail.com,Test Şirketi,Developer,Tech,Demo test
```

**ÖNEMLİ:** Test için kendi e-posta adresinizi kullanın!

---

## 🔒 Güvenlik

### GitHub'a Yüklenmeyen Dosyalar

`.gitignore` dosyası bu dosyaları otomatik olarak engelliyor:

- ✅ `*.csv` - E-posta listeleri
- ✅ `.env` - API key'ler
- ✅ `*_credentials.json` - Credential dosyaları
- ✅ `sendgrid.key` - API key dosyaları

### Kontrol Edin

```bash
git check-ignore contacts.csv  # Output: contacts.csv ✅
git status  # CSV dosyaları gösterilmemeli
```

---

## 🐛 Sorun Giderme

### Gmail ile ilgili sorunlar
→ `GMAIL_SETUP.md` dosyasına bakın

### SendGrid ile ilgili sorunlar
→ `SIMPLE_DEMO_SETUP.md` dosyasına bakın

### n8n çalışmıyor
```bash
docker ps  # n8n container'ı çalışıyor mu?
docker logs n8n  # Hata loglarını göster
```

### Webhook bulunamıyor
- Workflow aktif mi? (yeşil toggle)
- URL doğru mu? (`http://localhost:5678/webhook/simple-email-campaign`)

---

## 📊 Gmail vs SendGrid

| Özellik | Gmail SMTP | SendGrid |
|---------|------------|----------|
| Kurulum | App Password gerekli | API Key yeterli |
| Günlük Limit | 500 e-posta | 100 e-posta |
| Hız | 20/dakika | Sınırsız |
| Tracking | ❌ | ✅ (Açılma/tıklama) |
| Deliverability | Normal | Profesyonel |
| **Demo için** | ⭐ Önerilen | Alternatif |
| **Prodüksiyon için** | Sınırlı | ⭐ Önerilen |

---

## 💡 İpuçları

1. **İlk test için** kendi e-posta adresinize gönderin
2. **2-3 e-posta** yeterli (limit aşımı olmasın)
3. **n8n Execution'ı izleyin** (her adımı görebilirsiniz)
4. **AI prompt'unu özelleştirin** (Türkçe/İngilizce)
5. **Rate limiting'i açıklayın** (spam önleme)

---

## 📚 Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| `QUICKSTART.md` | 10 dakikada kurulum |
| `GMAIL_SETUP.md` | Gmail SMTP detaylı rehber |
| `SIMPLE_DEMO_SETUP.md` | Tam kurulum + sorun giderme |
| `.env.example` | Örnek environment variables |

---

## ✅ Checklist

- [ ] Docker yüklü
- [ ] Gemini API Key alındı
- [ ] Gmail App Password veya SendGrid API Key alındı
- [ ] n8n çalışıyor (http://localhost:5678)
- [ ] Workflow import edildi
- [ ] Credentials eklendi
- [ ] Workflow aktif
- [ ] Test e-postası gönderildi ve alındı

---

## 🎉 Hazırsınız!

Herşey tamam! Artık derste gösterebilirsiniz.

**Sorular için:**
- `QUICKSTART.md` - Hızlı kurulum
- `GMAIL_SETUP.md` - Gmail sorunları
- `SIMPLE_DEMO_SETUP.md` - Detaylı sorun giderme

---

## 🔗 Linkler

- **n8n Docs:** https://docs.n8n.io/
- **Gemini API:** https://ai.google.dev/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **SendGrid:** https://sendgrid.com/

---

**İyi sunumlar! 🚀**
