# ⚡ Hızlı Başlangıç - 10 Dakikada Demo Hazır!

Derste gösterim için hazır hale getirmek için bu adımları takip edin.

---

## 🎯 Gereksinimler

- Docker yüklü
- Gmail hesabı veya SendGrid hesabı
- İnternet bağlantısı
- 10 dakika

---

## 🚀 3 Adımda Kurulum

### 1️⃣ API Key'leri Alın (5 dakika)

#### Gemini API Key (Zorunlu)
1. https://makersuite.google.com/app/apikey adresine gidin
2. "Get API Key" → "Create API key in new project"
3. Key'i kopyalayın

#### E-posta Sağlayıcısı Seçin (Birini seçin)

**SEÇENEK A: Gmail SMTP (ÖNERİLEN - Kolay Kurulum)**
1. https://myaccount.google.com/security → 2-Step Verification aktif edin
2. https://myaccount.google.com/apppasswords → App Password oluşturun
3. App Name: `n8n Email`
4. 16 haneli şifreyi kopyalayın (örn: `abcd efgh ijkl mnop`)
5. **Detaylı talimatlar için:** `GMAIL_SETUP.md` dosyasına bakın

**SEÇENEK B: SendGrid API (Profesyonel)**
1. https://sendgrid.com/ → Sign Up (ücretsiz)
2. Settings → API Keys → Create API Key → Full Access
3. Key'i kopyalayın (SG. ile başlar)
4. **ÖNEMLİ:** Settings → Sender Authentication → Verify Single Sender
   - E-postanıza gelen doğrulama linkine tıklayın

### 2️⃣ n8n'i Başlatın (2 dakika)

**Gmail kullanıyorsanız:**

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="BURAYA_GEMINI_KEY" \
  -e GMAIL_USER="sizin-gmail@gmail.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**SendGrid kullanıyorsanız:**

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="BURAYA_GEMINI_KEY" \
  -e SENDGRID_API_KEY="BURAYA_SENDGRID_KEY" \
  -e SENDGRID_FROM_EMAIL="sizin-dogrulanmis-email@example.com" \
  -e SENDGRID_FROM_NAME="İsminiz" \
  -e SENDGRID_REPLY_TO="sizin-dogrulanmis-email@example.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Tarayıcıda açın:** http://localhost:5678

### 3️⃣ Workflow'u Import Edin (3 dakika)

#### Gmail Kullanıyorsanız:

1. n8n'de → **Workflows** → **Import from File**
2. Dosyayı seçin: `n8n-workflows/simple-email-campaign-gmail.json`
3. **Credentials** → **+ Add Credential** → **SMTP**
   - Credential Name: `Gmail SMTP`
   - User: `sizin-gmail@gmail.com`
   - Password: `abcd efgh ijkl mnop` (App Password)
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Security: `TLS`
   - Save
4. Workflow'da **"Gmail SMTP - Send Email"** node'una tıklayın
5. Credentials dropdown'dan **"Gmail SMTP"** seçin
6. Sağ üstten **"Active"** yapın

#### SendGrid Kullanıyorsanız:

1. n8n'de → **Workflows** → **Import from File**
2. Dosyayı seçin: `n8n-workflows/simple-email-campaign.json`
3. **Credentials** → **+ Add Credential** → **SendGrid API**
   - Name: `SendGrid API`
   - API Key: (SendGrid key'inizi yapıştırın)
   - Save
4. Workflow'da **"SendGrid - Send Email"** node'una tıklayın
5. Credentials dropdown'dan **"SendGrid API"** seçin
6. Sağ üstten **"Active"** yapın

---

## ✅ Test Edin

### Yöntem 1: HTML Sayfası ile (Önerilen - Derste Göstermek İçin)

1. Tarayıcıda açın: `demo-csv-uploader.html`
2. CSV içeriğini düzenleyin veya dosya seçin
3. "Kampanya Başlat" butonuna tıklayın
4. E-posta kutunuzu kontrol edin!

### Yöntem 2: curl ile (Hızlı Test)

```bash
curl -X POST http://localhost:5678/webhook/simple-email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "name,email,company,position,industry,notes\nTest User,sizin-email@example.com,Test Co,Developer,Tech,Test note",
    "campaignInfo": {
      "campaignName": "Hızlı Test"
    }
  }'
```

---

## 📁 Dosya Yapısı

```
OutreachAI/
├── n8n-workflows/
│   └── simple-email-campaign.json    ← n8n'e import edin
├── contacts-template.csv              ← CSV şablonu
├── demo-csv-uploader.html             ← Test arayüzü
├── SIMPLE_DEMO_SETUP.md               ← Detaylı kurulum
├── QUICKSTART.md                      ← Bu dosya
└── .env.example                       ← Örnek config
```

---

## 🎬 Derste Gösterim Planı

1. **n8n Dashboard'u gösterin** (http://localhost:5678)
2. **Workflow'u açın ve açıklayın:**
   - CSV parse
   - AI ile kişiselleştirme
   - SendGrid ile gönderim
3. **demo-csv-uploader.html'i açın**
4. **CSV içeriğini gösterin** (2-3 test e-postası)
5. **"Kampanya Başlat"a tıklayın**
6. **n8n'de execution'ı izleyin** (Executions menüsünden)
7. **E-posta kutusunu açın ve AI'ın ürettiği e-postaları gösterin**

---

## 🐛 Hızlı Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| n8n açılmıyor | Docker çalışıyor mu? `docker ps` |
| SendGrid 403 | E-postanız doğrulandı mı? |
| Gemini 403 | API Key doğru mu? Environment variable'da mı? |
| Webhook bulunamadı | Workflow aktif mi? (yeşil toggle) |
| E-posta gitmiyor | SendGrid credentials eklendi mi? |

---

## 📊 Beklenen Sonuç

Her CSV satırı için AI tarafından oluşturulmuş, kişiselleştirilmiş bir e-posta alacaksınız:

```
Konu: Merhaba John Doe - TechCorp için özel teklif

Merhaba John,

TechCorp'da CTO olarak yazılım sektöründe faaliyet gösterdiğinizi
biliyorum. AI çözümlerine olan ilginizi göz önünde bulundurarak...

[AI tarafından oluşturulmuş özel içerik]

En iyi dileklerimle,
[İsminiz]
```

---

## 📌 Notlar

- **Maliyet:** Tamamen ücretsiz (free tier'lar)
- **Hız:** Satır başına ~3-4 saniye (AI + rate limiting)
- **Limit:** SendGrid free: günde 100 e-posta
- **Güvenlik:** API key'ler environment variable'da, GitHub'a yüklenmiyor

---

## 🎓 Ekstra Özellikler (Zaman Varsa)

- **A/B Testing:** Farklı e-posta versiyonları
- **Follow-up:** Otomatik takip e-postaları
- **Analytics:** Açılma/tıklama oranları (SendGrid webhook ile)
- **CRM Sync:** HubSpot/Pipedrive entegrasyonu

---

**Hazırsınız! İyi sunumlar! 🚀**

Sorularınız için: SIMPLE_DEMO_SETUP.md dosyasına bakın.
