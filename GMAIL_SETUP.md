# 📧 Gmail SMTP Kurulum Rehberi

Gmail hesabınızdan n8n üzerinden e-posta göndermek için bu adımları takip edin.

---

## 🔐 Adım 1: Gmail App Password Oluşturun

Gmail'in 2-Factor Authentication (2FA) ile App Password kullanmanız gerekiyor.

### 1.1 Google Hesabınızda 2FA'yı Aktifleştirin

1. https://myaccount.google.com/security adresine gidin
2. **2-Step Verification** bölümüne tıklayın
3. Eğer aktif değilse, **Turn on** butonuna tıklayın
4. Telefon numaranız ile doğrulama yapın

### 1.2 App Password Oluşturun

1. https://myaccount.google.com/apppasswords adresine gidin
2. **Select app** → **Mail** seçin
3. **Select device** → **Other (Custom name)** seçin
4. İsim yazın: `n8n Email Automation`
5. **Generate** butonuna tıklayın
6. Ekranda çıkan **16 haneli şifreyi** kopyalayın
   - Örnek: `abcd efgh ijkl mnop`
   - **Bu şifreyi bir yere kaydedin!** Bir daha göremezsiniz.

---

## ⚙️ Adım 2: n8n'de Gmail SMTP Credentials Ekleyin

### 2.1 n8n'i Açın

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="BURAYA_GEMINI_KEY" \
  -e GMAIL_USER="sizin-gmail@gmail.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Tarayıcıda açın: http://localhost:5678

### 2.2 SMTP Credentials Oluşturun

1. n8n'de → **Credentials** menüsüne gidin
2. **+ Add Credential** butonuna tıklayın
3. Arama kutusuna `smtp` yazın
4. **SMTP** seçeneğini seçin
5. Şu bilgileri girin:

```
Credential Name: Gmail SMTP
User: sizin-gmail@gmail.com
Password: abcd efgh ijkl mnop (App Password'ünüz)
Host: smtp.gmail.com
Port: 587
Security: TLS
```

6. **Save** butonuna tıklayın

---

## 📦 Adım 3: Gmail Workflow'unu Import Edin

1. n8n'de → **Workflows** → **Import from File**
2. Bu klasördeki dosyayı seçin: `n8n-workflows/simple-email-campaign-gmail.json`
3. Workflow otomatik olarak yüklenecek

### 3.1 SMTP Credentials'ı Bağlayın

1. Workflow'da **"Gmail SMTP - Send Email"** node'una tıklayın
2. **Credentials** dropdown'ından **"Gmail SMTP"** seçin
3. **Save** butonuna tıklayın

### 3.2 Workflow'u Aktif Edin

1. Sağ üstteki **"Active"** toggle'ını açın (yeşil olmalı)
2. Workflow hazır!

---

## 🧪 Adım 4: Test Edin

### Yöntem 1: HTML Sayfası ile

1. `demo-csv-uploader.html` dosyasını tarayıcıda açın
2. CSV içeriğini düzenleyin (kendi Gmail adresinizi kullanın)
3. "Kampanya Başlat" butonuna tıklayın
4. E-posta kutunuzu kontrol edin!

### Yöntem 2: curl ile

```bash
curl -X POST http://localhost:5678/webhook/simple-email-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "name,email,company,position,industry,notes\nTest User,sizin-gmail@gmail.com,Test Co,Developer,Tech,Test note",
    "campaignInfo": {
      "campaignName": "Gmail Test"
    }
  }'
```

---

## 🔧 Örnek CSV

```csv
name,email,company,position,industry,notes
John Doe,john@example.com,TechCorp,CTO,Software,Interested in AI
Jane Smith,jane@startup.io,StartupIO,VP Engineering,Fintech,Looking for automation
Ali Yılmaz,sizin-gmail@gmail.com,Test Şirketi,Developer,Tech,Test için
```

**ÖNEMLİ:** Test ederken kendi e-posta adresinizi kullanın!

---

## ⚠️ Gmail Limitleri

Gmail'in gönderim limitleri vardır:

| Hesap Tipi | Günlük Limit | Dakika Başına |
|------------|--------------|---------------|
| Gmail Free | 500 e-posta/gün | 50 e-posta/dakika |
| Google Workspace | 2,000 e-posta/gün | 100 e-posta/dakika |

**n8n Workflow'da ayarlar:**
- Her e-posta arasında **3 saniye** bekleme var (rate limiting)
- Maksimum **20 e-posta/dakika** hızında gönderir
- Güvenli limitlerin içinde kalır

---

## 🐛 Sorun Giderme

### Hata: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Çözüm:**
- 2FA aktif mi kontrol edin
- App Password doğru kopyalandı mı?
- Gmail hesabınızda "Less secure app access" kapalı olmalı (App Password kullanıyorsanız)

### Hata: "Connection timeout"

**Çözüm:**
- Host: `smtp.gmail.com` doğru yazıldı mı?
- Port: `587` doğru mu?
- Security: `TLS` seçilmiş mi?
- İnternet bağlantınız çalışıyor mu?

### Hata: "Authentication failed"

**Çözüm:**
- App Password'ü yeniden oluşturun
- Boşlukları silip tekrar deneyin (bazı sistemler boşluk kabul etmez)
- n8n Credentials'ı silip yeniden oluşturun

### E-postalar spam'e düşüyor

**Çözüm:**
- İlk e-postanızı manuel olarak gönderin (Gmail'den doğrudan)
- "Not spam" olarak işaretleyin
- Kişisel e-postalar için bu normal

### Gmail "Suspicious activity" uyarısı

**Çözüm:**
- Gmail'e gidin ve "Yes, it was me" butonuna tıklayın
- https://accounts.google.com/DisplayUnlockCaptcha adresine gidin
- "Continue" butonuna tıklayın
- 10 dakika bekleyip tekrar deneyin

---

## 🎯 Derste Gösterim İçin İpuçları

1. **Kendi Gmail adresinize gönderin** - Anında sonuç görürsünüz
2. **2-3 test e-postası yeterli** - Limit aşımı olmasın
3. **n8n Execution'ı gösterin** - Her adımı izletin
4. **AI'ın oluşturduğu içeriği vurgulayın** - Kişiselleştirmeyi gösterin
5. **Rate limiting'i açıklayın** - Neden bekleme olduğunu anlatın

---

## 📊 Gmail vs SendGrid Karşılaştırması

| Özellik | Gmail SMTP | SendGrid |
|---------|------------|----------|
| Kurulum | App Password gerekli | API Key yeterli |
| Günlük Limit | 500 (free) | 100 (free) |
| Hız | 20/dakika | Sınırsız |
| Tracking | Yok | Açılma/tıklama tracking |
| Deliverability | Normal | Profesyonel |
| Kullanım | Kişisel/Test | Profesyonel/Prodüksiyon |
| Maliyet | Ücretsiz | Ücretsiz (100/gün) |

**Öneri:**
- **Demo için:** Gmail SMTP (kolay kurulum)
- **Prodüksiyon için:** SendGrid (daha güvenilir)

---

## ✅ Hızlı Checklist

- [ ] 2FA aktif
- [ ] App Password oluşturuldu
- [ ] n8n'de SMTP credentials eklendi
- [ ] Gmail workflow import edildi
- [ ] Credentials node'a bağlandı
- [ ] Workflow aktif
- [ ] Test e-postası gönderildi
- [ ] E-posta alındı

---

## 🔒 Güvenlik Notları

### GitHub'a Yüklemeyin!

- ✅ `.gitignore` zaten App Password'leri engelliyor
- ❌ `.env` dosyasını GitHub'a yüklemeyin
- ❌ App Password'ü kod içine yazmayın
- ✅ Sadece environment variables kullanın

### Kontrol Edin

```bash
git check-ignore .env  # Output: .env (engellendi ✅)
git status  # .env gösterilmemeli
```

---

## 📞 Destek

Gmail SMTP ile ilgili sorularınız için:
- Gmail Help: https://support.google.com/mail
- n8n Email Send Node Docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.emailsend/

---

**Gmail ile hazırsınız! İyi sunumlar! 🚀**
