# 🚀 Basit Demo Kurulumu - n8n ile E-posta Otomasyonu

Bu rehber, derste göstermek için **Apollo kullanmadan**, sadece **CSV + Gemini AI + SendGrid** ile basit bir e-posta kampanyası oluşturmanız için hazırlanmıştır.

---

## 📋 İhtiyaç Listesi

1. **n8n** (lokal olarak çalışacak - Docker ile)
2. **Google Gemini API Key** (ücretsiz - AI ile e-posta kişiselleştirme için)
3. **SendGrid API Key** (ücretsiz - günde 100 e-posta)
4. **CSV dosyası** (e-posta gönderilecek kişilerin listesi)

---

## 🔧 Adım 1: n8n Kurulumu (Docker ile)

### n8n'i Çalıştırın

Terminalden şu komutu çalıştırın:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Ne yapıyor?**
- n8n'i `localhost:5678` portunda başlatıyor
- Workflow'larınız `~/.n8n` klasöründe saklanıyor

### n8n'i Açın

Tarayıcınızda şu adresi açın:
```
http://localhost:5678
```

İlk açılışta kullanıcı adı ve şifre oluşturun.

---

## 🔑 Adım 2: API Key'leri Alın

### 2.1 Google Gemini API Key

1. [Google AI Studio](https://makersuite.google.com/app/apikey)'ya gidin
2. "Get API Key" butonuna tıklayın
3. API Key'i kopyalayın (örnek: `AIzaSyC...`)
4. **ÜCRETSİZ** - ayda 60 istek/dakika

### 2.2 SendGrid API Key

1. [SendGrid](https://sendgrid.com/)'e üye olun (ücretsiz hesap)
2. Settings → API Keys → Create API Key
3. Full Access verin
4. API Key'i kopyalayın (örnek: `SG.xxx...`)
5. **ÖNEMLİ:** E-posta adresinizi doğrulatın!
   - Settings → Sender Authentication → Verify Single Sender
   - E-postanıza gelen linke tıklayın

---

## 📦 Adım 3: n8n'e Workflow'u Import Edin

### 3.1 Workflow Dosyasını İndirin

Bu proje klasöründeki dosyayı kullanın:
```
n8n-workflows/simple-email-campaign.json
```

### 3.2 n8n'e Import Edin

1. n8n web arayüzünde (http://localhost:5678) → **Workflows** → **Import from File**
2. `simple-email-campaign.json` dosyasını seçin
3. Workflow otomatik olarak yüklenecek

### 3.3 Environment Variables'ı Ayarlayın

n8n'de **Settings** → **Environments** bölümüne gidin ve şu değişkenleri ekleyin:

```bash
GOOGLE_AI_API_KEY=AIzaSyC... # Gemini API Key'iniz
SENDGRID_API_KEY=SG.xxx... # SendGrid API Key'iniz
SENDGRID_FROM_EMAIL=sizin-email@example.com # Doğrulanmış e-posta
SENDGRID_FROM_NAME=İsminiz veya Şirket Adı
SENDGRID_REPLY_TO=sizin-email@example.com
```

**Alternatif Yöntem (Docker ile çalıştırıyorsanız):**

Docker komutunu şöyle güncelleyin:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="AIzaSyC..." \
  -e SENDGRID_API_KEY="SG.xxx..." \
  -e SENDGRID_FROM_EMAIL="sizin-email@example.com" \
  -e SENDGRID_FROM_NAME="İsminiz" \
  -e SENDGRID_REPLY_TO="sizin-email@example.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 3.4 SendGrid Credentials Ekleyin

1. n8n'de **Credentials** menüsüne gidin
2. **+ Add Credential** → **SendGrid API**
3. Credential Name: `SendGrid API`
4. API Key: SendGrid API Key'inizi yapıştırın
5. **Save**

---

## 📧 Adım 4: CSV Dosyanızı Hazırlayın

### 4.1 Örnek CSV Şablonu

Bu proje klasöründeki `contacts-template.csv` dosyasını kullanın:

```csv
name,email,company,position,industry,notes
John Doe,john@example.com,TechCorp,CTO,Software,Interested in AI solutions
Jane Smith,jane@startup.io,StartupIO,VP Engineering,Fintech,Looking for automation tools
Ali Yılmaz,ali@sirket.com.tr,Teknoloji A.Ş.,Yazılım Müdürü,E-ticaret,Bulut çözümleri araştırıyor
```

### 4.2 Kendi Listenizi Oluşturun

- Excel veya Google Sheets'te listeyi hazırlayın
- **CSV olarak kaydedin** (File → Download → CSV)
- Sütunlar: `name`, `email`, `company`, `position`, `industry`, `notes`

---

## 🚀 Adım 5: Workflow'u Test Edin

### 5.1 Workflow'u Aktif Edin

1. n8n'de workflow'u açın
2. Sağ üstteki **"Active"** düğmesine tıklayın (yeşil olmalı)

### 5.2 Webhook URL'sini Kopyalayın

1. İlk node **"Webhook - CSV Upload"** üzerine tıklayın
2. **"Test URL"** veya **"Production URL"** kopyalayın
3. Örnek URL: `http://localhost:5678/webhook/simple-email-campaign`

### 5.3 CSV'yi Gönderin

**Postman veya curl ile test edin:**

```bash
curl -X POST http://localhost:5678/webhook/simple-email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "name,email,company,position,industry,notes\nTest User,test@example.com,Test Co,Developer,Tech,Test note",
    "campaignInfo": {
      "campaignName": "Test Campaign"
    }
  }'
```

**Veya Postman ile:**
- Method: `POST`
- URL: `http://localhost:5678/webhook/simple-email-campaign`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "csvData": "name,email,company,position,industry,notes\nAli Test,ali@example.com,Test Şirket,Developer,Tech,Test mesajı",
  "campaignInfo": {
    "campaignName": "Demo Kampanya"
  }
}
```

---

## 🎬 Adım 6: Derste Gösterim

### Gösterim Senaryosu

1. **n8n Dashboard'u Açık Tutun**
   - http://localhost:5678/workflows
   - Workflow'u gösterin

2. **CSV Dosyanızı Hazırlayın**
   - 3-5 test e-posta adresi (kendi e-postalarınız olabilir)
   - `contacts-template.csv` dosyasını düzenleyin

3. **Postman veya Basit HTML Form ile Gönder**
   - CSV içeriğini JSON'a çevirin
   - Webhook'a POST isteği gönderin

4. **n8n'de Execution'ı İzleyin**
   - Workflow'un çalıştığını gösterin
   - Her adımı (CSV parse, AI, SendGrid) gösterin

5. **E-posta Kutunuzu Açın**
   - Gelen e-postaları gösterin
   - AI tarafından kişiselleştirilmiş içeriği vurgulayın

---

## 📊 Workflow Akışı

```
1. Webhook (CSV alır)
   ↓
2. CSV Parse (JSON'a çevirir)
   ↓
3. AI Prompt Hazırla (her kişi için özel prompt)
   ↓
4. Gemini AI (kişiselleştirilmiş e-posta oluşturur)
   ↓
5. E-posta Formatla (subject + body)
   ↓
6. SendGrid (e-posta gönderir)
   ↓
7. Rate Limiting (2 saniye bekle - spam önleme)
   ↓
8. Özet Oluştur (kaç e-posta gönderildi?)
   ↓
9. Response Döndür (başarı mesajı)
```

---

## 🐛 Sorun Giderme

### Hata: SendGrid 401 Unauthorized

**Çözüm:**
- SendGrid API Key'inizi kontrol edin
- n8n'de Credentials doğru ayarlandı mı?
- `SENDGRID_API_KEY` environment variable doğru mu?

### Hata: SendGrid 403 Forbidden

**Çözüm:**
- E-posta adresinizi SendGrid'de doğruladınız mı?
- Settings → Sender Authentication → Verify Single Sender

### Hata: Gemini API 403 Error

**Çözüm:**
- API Key'iniz doğru mu?
- API Key'i `GOOGLE_AI_API_KEY` olarak environment variable'a eklediniz mi?
- Google AI Studio'da API kullanımı aktif mi?

### Hata: Webhook bulunamadı

**Çözüm:**
- Workflow aktif mi? (yeşil "Active" düğmesi)
- n8n çalışıyor mu? (`docker ps` ile kontrol edin)
- URL doğru mu? (http://localhost:5678/webhook/simple-email-campaign)

### E-postalar gönderilmiyor

**Çözüm:**
- n8n'de Executions'a bakın (sağ menüden)
- Hangi adımda hata aldığını görün
- SendGrid dashboard'da Activity Feed kontrol edin

---

## 🎓 Derste Vurgulayacağınız Noktalar

1. **No-Code Automation:** n8n ile kod yazmadan otomasyon
2. **AI Entegrasyonu:** Gemini AI ile e-posta kişiselleştirme
3. **Gerçek Dünya Kullanımı:** SendGrid profesyonel e-posta gönderimi
4. **Ölçeklenebilirlik:** CSV'den binlerce kişiye gönderim yapılabilir
5. **Maliyet:** Tümüyle ücretsiz (free tier'lar ile)

---

## 🔒 Güvenlik Notları

### GitHub'a Yüklemeyin!

Bu dosyalar asla GitHub'a yüklenMEMELİ:
- ✅ `.gitignore` dosyasında zaten engellendi
- ❌ `*.csv` (e-posta listeleri)
- ❌ `.env` (API key'ler)
- ❌ `sendgrid.key` (API key dosyaları)
- ❌ `*_credentials.json`

### Kontrol Edin

```bash
# GitHub'a yüklemeden önce kontrol edin
git status

# .gitignore'un çalıştığını test edin
git check-ignore contacts.csv  # "contacts.csv" çıktısı vermeli
```

---

## 📞 Destek

Sorularınız için:
- n8n Dokumentasyon: https://docs.n8n.io/
- SendGrid Docs: https://docs.sendgrid.com/
- Gemini API Docs: https://ai.google.dev/docs

---

## ✅ Hızlı Checklist

- [ ] Docker yüklü
- [ ] n8n çalışıyor (http://localhost:5678)
- [ ] Gemini API Key alındı
- [ ] SendGrid API Key alındı
- [ ] SendGrid'de e-posta doğrulandı
- [ ] Workflow import edildi
- [ ] Environment variables ayarlandı
- [ ] SendGrid credentials eklendi
- [ ] CSV dosyası hazır
- [ ] Test e-postası gönderildi ve başarılı

---

**Hazırsınız! Başarılar! 🎉**
