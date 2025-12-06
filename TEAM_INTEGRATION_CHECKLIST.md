# ✅ Team Integration Checklist - OutreachAI

**Son Güncelleme:** 2025-01-06
**Proje Durumu:** Frontend HAZIR ✓ | n8n & API Entegrasyonu BEKLENIYOR ⏳

---

## 📊 Genel Durum

| Bileşen | Durum | Kimin Sorumluluğunda |
|---------|-------|---------------------|
| **Frontend (Web App)** | ✅ Hazır | Haktan |
| **Firebase Auth & Firestore** | ✅ Hazır | Haktan |
| **Token Sistemi** | ✅ Çalışıyor | Haktan |
| **n8n Webhook Endpoints** | ⏳ Yapılacak | Özgür |
| **Apollo/Snov.io Entegrasyonu** | ⏳ Yapılacak | Emre |
| **SendGrid Email Gönderimi** | ⏳ Yapılacak | Emre/Özgür |
| **Claude/Gemini AI** | ⏳ Yapılacak | Özgür |

---

## 🎯 Haktan (Frontend - TAMAMLANDI ✅)

### Tamamlanan İşler:
- [x] Landing page (`index.html`) with campaign form
- [x] User authentication (`login.html`)
- [x] User dashboard (`user.html`)
- [x] Token management system
- [x] Firebase Authentication entegrasyonu
- [x] Firestore database entegrasyonu
- [x] Campaign verilerini Firestore'a kaydetme
- [x] Responsive design + dark mode
- [x] Campaign form validation

### Yapılması Gereken Son İş:
- [ ] **`config.js` dosyasını güncellemek** (Özgür'den n8n webhook URL'lerini alınca)

**Dosya:** `assets/js/config.js`

```javascript
webhooks: {
    launchCampaign: 'http://AWS_IP:5678/webhook/launch-campaign',  // Özgür'den alınacak
    checkStatus: 'http://AWS_IP:5678/webhook/campaign-status',     // Özgür'den alınacak
    previewEmail: 'http://AWS_IP:5678/webhook/preview-email',      // Özgür'den alınacak
},
```

### Test Etmek İçin:
1. `python3 -m http.server 8000` ile serveri başlat
2. `http://localhost:8000` aç
3. Login ol
4. Dashboard'dan "New Campaign" butonuna tıkla
5. Campaign formunu doldur ve gönder
6. Browser console'da campaign verilerini göreceksin
7. Firestore'da `campaigns` collection'ına kaydedildiğini doğrula

---

## 🔧 Özgür (n8n Workflows)

### Yapılması Gerekenler:

#### 1. AWS'deki n8n Instance'ını Aç
- [ ] AWS sunucusunda n8n'i başlat
- [ ] n8n'in dış dünyaya açık olduğundan emin ol (port 5678)
- [ ] Public IP adresini al

#### 2. 3 Webhook Workflow'u Oluştur

##### **Workflow 1: Launch Campaign**
- [ ] Webhook node ekle: `/webhook/launch-campaign` (POST)
- [ ] CORS headers ekle:
  ```json
  {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
  ```
- [ ] Function node ile campaign data'yı parse et
- [ ] Apollo/Snov.io node ile lead generation başlat (Emre'den API key alacaksın)
- [ ] Loop node ile her lead için:
  - Claude AI ile personalized email üret
  - SendGrid ile email gönder (Emre'den API key alacaksın)
  - Delay ekle (rate limiting için)
- [ ] Firebase Admin SDK ile Firestore'daki campaign'i güncelle
- [ ] Response dön:
  ```json
  {
    "success": true,
    "campaignId": "{{$json.campaignId}}",
    "status": "processing",
    "message": "Campaign launched successfully!"
  }
  ```

**Input Example (Frontend'den gelecek):**
```json
{
  "campaignId": "camp_1704556800000_abc123",
  "userId": "firebase-user-id",
  "userEmail": "user@example.com",
  "config": {
    "name": "Q4 SaaS Outreach",
    "targetAudience": "CTOs at Series A-C fintech startups",
    "valueProposition": "We reduce cloud costs by 30%",
    "emailLimit": 50,
    "leadSource": "apollo"
  },
  "options": {
    "abTesting": false,
    "autoFollowup": true,
    "spamCheck": true,
    "crmSync": true
  }
}
```

##### **Workflow 2: Check Campaign Status**
- [ ] Webhook node ekle: `/webhook/campaign-status` (GET)
- [ ] Query parameter'dan `campaignId` al
- [ ] Firebase/Database'den campaign status çek
- [ ] Response dön:
  ```json
  {
    "campaignId": "camp_123",
    "status": "active",
    "leads": 85,
    "emailsSent": 42,
    "totalLeads": 100,
    "progress": 42
  }
  ```

##### **Workflow 3: Preview Email**
- [ ] Webhook node ekle: `/webhook/preview-email` (POST)
- [ ] Claude AI node ile sample email üret
- [ ] Response dön:
  ```json
  {
    "subject": "Quick question about [Company]",
    "body": "Hi [Name],\n\nI noticed..."
  }
  ```

#### 3. Webhook URL'lerini Paylaş
- [ ] 3 webhook URL'ini Haktan'a ilet (Slack/WhatsApp)
- [ ] Örnek: `http://YOUR_AWS_IP:5678/webhook/launch-campaign`

#### 4. Test Et
```bash
curl -X POST http://YOUR_AWS_IP:5678/webhook/launch-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "test_123",
    "config": {
      "name": "Test Campaign",
      "targetAudience": "CTOs at fintech startups",
      "valueProposition": "Test value prop",
      "emailLimit": 10,
      "leadSource": "apollo"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "campaignId": "test_123",
  "status": "processing"
}
```

---

## 🔑 Emre (API Keys & Backend)

### Yapılması Gerekenler:

#### 1. Apollo.io API Key
- [ ] [Apollo.io](https://app.apollo.io/) hesabı aç
- [ ] Settings → API → API Key'i kopyala
- [ ] Özgür'e ilet

**Test için curl:**
```bash
curl -X POST https://api.apollo.io/v1/mixed_people/search \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_APOLLO_KEY" \
  -d '{
    "q_keywords": "CTO fintech Series A",
    "page": 1,
    "per_page": 10
  }'
```

#### 2. Snov.io API (Alternatif)
- [ ] [Snov.io](https://snov.io/) hesabı aç
- [ ] Settings → API → Client ID ve Secret al
- [ ] Özgür'e ilet

#### 3. SendGrid API Key
- [ ] [SendGrid](https://sendgrid.com/) hesabı aç (ücretsiz 100 email/day)
- [ ] Settings → API Keys → Create API Key
- [ ] Key'i kopyala (başı `SG.` ile başlar)
- [ ] Özgür'e ilet

**Önemli:** SendGrid'de gönderen email adresini verify et!
- [ ] Settings → Sender Authentication
- [ ] Single Sender Verification
- [ ] Email adresine gelen linke tıkla

**Test için curl:**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}]
    }],
    "from": {"email": "your-verified-email@gmail.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "Hello!"}]
  }'
```

#### 4. Claude AI API Key
- [ ] [Anthropic Console](https://console.anthropic.com/) hesabı aç
- [ ] API Keys → Create Key
- [ ] Özgür'e ilet

**Test için curl:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{
      "role": "user",
      "content": "Generate a cold email for CTOs at fintech startups"
    }]
  }'
```

#### 5. Firebase Admin SDK (Özgür için)
- [ ] Firebase Console → Project Settings → Service Accounts
- [ ] "Generate New Private Key" butonuna bas
- [ ] JSON dosyasını indir
- [ ] Özgür'e güvenli şekilde ilet (Slack DM)

**n8n'de kullanımı:**
```javascript
const admin = require('firebase-admin');
const serviceAccount = JSON.parse($env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
```

---

## 🔗 Entegrasyon Akışı

### Kullanıcı bir campaign başlattığında:

```
1. Frontend (index.html)
   ↓ User fills campaign form
   ↓ Clicks "Launch Campaign"

2. main.js → launchCampaign()
   ↓ Saves to Firestore (campaigns collection)
   ↓ Sends POST to n8n webhook

3. n8n Workflow (Özgür)
   ↓ Receives campaign data
   ↓ Calls Apollo.io API (Emre's key)
   ↓ Gets 50 leads

4. For each lead:
   ↓ Claude AI generates personalized email
   ↓ SendGrid sends email (Emre's key)
   ↓ Updates Firestore campaign stats

5. Frontend polls status every 5 seconds
   ↓ Calls /webhook/campaign-status
   ↓ Shows progress bar
```

---

## 🧪 Tam Test Senaryosu

### Test 1: Token Satın Alma (Hazır ✅)
1. `http://localhost:8000/login.html` aç
2. Yeni hesap oluştur
3. Dashboard → Tokens → "Choose Plan" (Professional)
4. Confirm Purchase
5. Token balance'ın 20,000 olduğunu gör

### Test 2: Campaign Başlatma (Entegrasyon Sonrası)
1. Dashboard → "New Campaign"
2. Form doldur:
   - Campaign Name: "Test Campaign"
   - Target Audience: "CTOs at fintech startups in SF"
   - Value Proposition: "We reduce cloud costs by 30%"
   - Daily Limit: 50
   - Lead Source: Apollo.io
3. "Launch Campaign" tıkla
4. **Beklenen:**
   - Toast: "Campaign launched successfully!"
   - Firestore'da yeni campaign document
   - n8n workflow başlar
   - Apollo.io'dan leads gelir
   - Emailler gönderilir
   - Dashboard'da progress güncellenir

### Test 3: Email Preview (Entegrasyon Sonrası)
1. Campaign formunda "Preview Email" tıkla
2. **Beklenen:**
   - Modal açılır
   - Claude AI'dan generated email görünür

---

## 📋 Son Adım: Deployment

### Frontend (Haktan)
- [ ] GitHub'a push
- [ ] GitHub Pages deploy (veya Netlify/Vercel)

### n8n (Özgür)
- [ ] AWS'de production mode'da çalıştır
- [ ] Domain adı ekle (opsiyonel)
- [ ] SSL sertifikası ekle (Let's Encrypt)

### API Keys (Emre)
- [ ] Tüm API key'lerin çalıştığını doğrula
- [ ] Rate limit'leri kontrol et
- [ ] Backup plan (Snov.io alternatif olarak hazır)

---

## 🎓 Demo İçin Hazırlık

### Sunum Sırası:
1. **Landing Page** → "Problem-Solution" anlatımı (Haktan)
2. **Authentication** → Firebase Auth demo (Haktan)
3. **Token Purchase** → Demo token satın alma (Haktan)
4. **Campaign Launch** → LIVE campaign başlatma (Hep birlikte)
5. **n8n Workflow** → Arka planda ne oluyor göster (Özgür)
6. **Email Delivery** → SendGrid dashboard'da delivered emails (Emre)
7. **Analytics** → Campaign progress tracking (Haktan)

### Demo Email'leri Kime Gönderelim?
- [ ] Kendi email adreslerinizi kullanın
- [ ] Test için 5-10 farklı email adresi hazırlayın
- [ ] Demo sırasında gerçek zamanlı gönderim gösterin

---

## ⏰ Timeline

### Bugün (6 Ocak):
- [x] Haktan: Frontend tamamlandı ✅
- [ ] Emre: API key'leri al (2 saat)
- [ ] Özgür: n8n workflow'ları başlat (3-4 saat)

### Yarın (7 Ocak):
- [ ] Özgür: Workflow'ları test et
- [ ] Emre: API entegrasyonlarını test et
- [ ] Haktan: config.js'i güncelle ve test et
- [ ] Hep birlikte: End-to-end test

### Son Gün (8 Ocak):
- [ ] Bug fixes
- [ ] Demo rehearsal
- [ ] Sunum hazırlığı

---

## 📞 İletişim

**Slack/WhatsApp Group:** OutreachAI Team

**Sorular için:**
- Frontend: @Haktan
- n8n: @Özgür
- API: @Emre

---

## 🚀 Başarılar Diliyorum!

Projede %80'i hazır, sadece API entegrasyonları kaldı. Herkes kendi kısmını hallederse 1-2 günde bitirebiliriz! 💪
