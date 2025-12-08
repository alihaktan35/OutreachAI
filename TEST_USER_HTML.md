# ✅ user.html - n8n Entegrasyon Testi

## 🎯 Yapılan Değişiklikler

### 1. Form Basitleştirildi
- ❌ Kaldırıldı: Daily Email Limit
- ❌ Kaldırıldı: Target Audience
- ❌ Kaldırıldı: Value Proposition
- ❌ Kaldırıldı: Lead Source dropdown
- ❌ Kaldırıldı: Advanced Options
- ❌ Kaldırıldı: Preview Email butonu

### 2. Sadece Kalan Alanlar
- ✅ **Campaign Name** (varsayılan: "Demo Campaign")
- ✅ **n8n Status Indicator** (yeşil/kırmızı/sarı)
- ✅ **CSV Upload** (required, file selection feedback ile)
- ✅ **Cancel** ve **Launch Campaign** butonları

### 3. CSV Upload Özellikleri
- Dosya seçildiğinde isim gösterilir
- ✅ İkon ve "File selected: filename.csv" mesajı
- Required field - olmadan gönderilmez

### 4. n8n Status
- 🟡 Sarı (Checking...) → İlk yüklemede
- 🟢 Yeşil (Active) → n8n çalışıyorsa
- 🔴 Kırmızı (Offline) → n8n kapalıysa
- Her 30 saniyede otomatik kontrol

---

## 🧪 Test Adımları

### 1. n8n'i Başlat
```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="YOUR_GEMINI_KEY" \
  -e GMAIL_USER="your-gmail@gmail.com" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Workflow'u Aktif Et
- http://localhost:5678 → Workflows
- simple-email-campaign-gmail.json açın
- **Active** toggle'ı açın (yeşil)

### 3. user.html'i Aç
```
file:///Users/ahs/Documents/GitHub/OutreachAI/user.html
```

### 4. Test Et
1. **Giriş yapın** (Firebase auth gerekiyor)
2. **Campaigns** → **New Campaign** tıklayın
3. **n8n Status** kontrol edin:
   - 🟢 Yeşil olmalı
   - Değilse n8n workflow'u aktif değil

4. **Campaign Name** girin (veya varsayılanı bırakın)
5. **CSV dosyası seçin:**
   - `/Users/ahs/Documents/GitHub/OutreachAI/test-CSV-AHS.csv`
6. **Launch Campaign** tıklayın

### 5. Beklenen Davranış
- ✅ "Launching Campaign..." loading state
- ✅ n8n'e POST isteği gidiyor
- ✅ Success toast mesajı
- ✅ Alert box: "Check n8n Executions..."
- ✅ Form kapanıyor ve temizleniyor

### 6. n8n'de Kontrol
- http://localhost:5678
- **Executions** sekmesi
- Son execution'ı görmelisiniz
- Adımları izleyin:
  1. ✅ Webhook received
  2. ✅ Parse CSV
  3. ✅ Prepare AI Prompt
  4. ✅ Gemini AI (e-posta oluşturma)
  5. ✅ Format Email
  6. ✅ Gmail SMTP (gönderim)
  7. ✅ Summary

---

## 🐛 Sorun Giderme

### CSV Upload Çalışmıyor
**Kontrol:**
- File input `required` mi?
- File seçildiğinde isim gösteriliyor mu?
- Console'da hata var mı?

**Çözüm:**
- F12 → Console kontrol edin
- `csvFile` input elementi var mı?

### n8n Status Hep Kırmızı
**Kontrol:**
- n8n çalışıyor mu? → `docker ps`
- Workflow aktif mi? → n8n'de toggle yeşil
- Production URL doğru mu? → `http://localhost:5678/webhook/simple-email-campaign`

**Çözüm:**
```bash
# n8n'i yeniden başlat
docker stop n8n
docker run -it --rm --name n8n -p 5678:5678 \
  -e GOOGLE_AI_API_KEY="..." \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Campaign Launch Hata Veriyor
**Kontrol:**
- CSV formatı doğru mu? (header: name,email,company,position,industry,notes)
- n8n workflow aktif mi?
- Console'da detaylı hata var mı?

**Çözüm:**
- test-CSV-AHS.csv kullanın (doğru format)
- n8n Executions'da hata log'una bakın

### Email Gönderilmiyor
**Kontrol:**
- n8n'de Gemini API hatası var mı? (quota)
- Gmail SMTP credentials ekli mi?
- n8n execution'da hangi adımda takılıyor?

**Çözüm:**
- Gemini quota: Farklı API key deneyin veya bekleyin
- Gmail credentials: n8n'de SMTP ayarlarını kontrol edin

---

## 📊 Başarı Kriterleri

✅ **Form basitleştirildi** - Sadece Campaign Name + CSV upload
✅ **n8n Status çalışıyor** - Yeşil/kırmızı gösteriyor
✅ **CSV upload çalışıyor** - Dosya seçimi feedback veriyor
✅ **Campaign launch çalışıyor** - n8n webhook'a POST başarılı
✅ **Loading state** - Button animasyonu çalışıyor
✅ **Success mesajı** - Toast + alert gösteriliyor
✅ **Form temizleniyor** - Launch'tan sonra reset

---

## 🎯 Sonuç

user.html artık **demo-csv-uploader.html gibi** çalışıyor:
- Basit ve temiz form
- n8n status göstergesi
- CSV upload ile kampanya başlatma
- Gerçek zamanlı feedback

**Test için hazır!** 🚀
