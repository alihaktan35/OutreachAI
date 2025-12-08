# 📊 Campaign Details Feature - Kullanım Rehberi

## ✅ Yapılan Değişiklikler

### 1. **Yeni Dosyalar Eklendi**

```
OutreachAI/
├── assets/
│   ├── css/
│   │   └── campaign-details.css (YENİ)
│   └── js/
│       └── campaign-manager.js (YENİ)
```

### 2. **user.html Güncellemeleri**
- ✅ `campaign-details.css` eklendi
- ✅ `campaign-manager.js` eklendi (dashboard.js'den önce!)
- ✅ Campaign Manager Firebase ile entegre

### 3. **dashboard.js Güncellemesi**
- ✅ Auth state'de Campaign Manager initialize ediliyor

### 4. **n8n-integration.js Güncellemesi**
- ✅ Campaign launch'tan sonra Firebase'e kayıt
- ✅ Contact listesi parse ediliyor
- ✅ Campaign listesi otomatik yenileniyor

---

## 🎯 Özellikler

### Firebase'e Kaydedilen Veriler

```javascript
{
  campaignId: "camp_1234567890_abc",
  userId: "user-firebase-uid",
  campaignName: "Demo Campaign",
  status: "processing",
  createdAt: Timestamp,
  contacts: [
    {
      name: "Ali Haktan SIGIN",
      email: "alihaktan35@hotmail.com",
      company: "AHS Bilisim",
      position: "CEO",
      industry: "Software",
      notes: "Interested in AI"
    },
    // ... daha fazla contact
  ],
  emailsSent: 0,
  emailsTotal: 1,
  successCount: 0,
  failureCount: 0,
  csvData: "name,email,company,...\nAli Haktan SIGIN,...",
  metadata: {
    userEmail: "user@example.com",
    timestamp: "2025-12-08T..."
  }
}
```

### Campaign Card Özellikleri

- **Campaign Name**: Kampanya adı
- **Created Date**: TR saati ile oluşturma tarihi
- **Status Badge**:
  - 🔄 Processing (sarı)
  - ✅ Completed (yeşil)
  - ❌ Failed (kırmızı)
  - ⏸️ Paused (gri)
- **Stats**:
  - 👥 Contacts: Toplam kişi sayısı
  - 📧 Sent: Gönderilen e-posta sayısı
  - ✅ Success: Başarılı gönderimler
  - ❌ Failed: Başarısız gönderimler
- **View Details Button**: Detay modal'ı açar

---

## 📋 Campaign Details Modal

### Bölümler:

#### 1. Basic Information
- Campaign Name
- Campaign ID
- Status (badge ile)
- Created (TR timezone)

#### 2. Email Statistics (4 stat card)
- 👥 Total Contacts
- 📧 Emails Sent
- ✅ Successful
- ❌ Failed

#### 3. Contact List (tablo)
- İlk 10 contact gösterilir
- Columns: Name, Email, Company, Position
- 10'dan fazlaysa: "... and X more contacts"

#### 4. CSV Preview
- İlk 5 satır gösterilir
- Monospace font ile
- Scroll edilebilir

---

## 🧪 Test Etme

### 1. user.html'i Açın
```
file:///Users/ahs/Documents/GitHub/OutreachAI/user.html
```

### 2. Firebase'e Giriş Yapın
- Login sayfasından giriş yapın
- Dashboard'a yönlendirileceksiniz

### 3. Yeni Campaign Oluşturun
- **Campaigns** → **New Campaign**
- Campaign Name: "Test Campaign"
- CSV yükleyin
- **Launch Campaign**

### 4. Campaign Listesini Görün
- Form kapandıktan sonra (1 saniye içinde)
- Campaign otomatik olarak listede görünür
- Status: 🔄 Processing

### 5. Campaign Details'i Açın
- **View Details** butonuna tıklayın
- Modal açılır
- Tüm bilgileri görün:
  - Campaign info
  - Statistics
  - Contact list (tablo)
  - CSV preview

---

## 🔍 Firebase Console'da Kontrol

1. **Firebase Console**: https://console.firebase.google.com/
2. **Firestore Database** → **campaigns** collection
3. Campaign document'i görün:
   ```
   campaigns/
     └── camp_1234567890_abc/
         ├── campaignId: "camp_..."
         ├── userId: "..."
         ├── campaignName: "Demo Campaign"
         ├── status: "processing"
         ├── contacts: [...]
         ├── csvData: "..."
         └── createdAt: Timestamp
   ```

---

## 📊 Firestore Security Rules (Opsiyonel)

Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /campaigns/{campaignId} {
      // Sadece kendi kampanyalarını görebilir
      allow read: if request.auth != null &&
                    resource.data.userId == request.auth.uid;

      // Sadece kendi kampanyasını oluşturabilir
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;

      // Sadece kendi kampanyasını güncelleyebilir
      allow update: if request.auth != null &&
                      resource.data.userId == request.auth.uid;

      // Sadece kendi kampanyasını silebilir
      allow delete: if request.auth != null &&
                      resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🎨 UI Screenshots

### Campaign List
```
┌─────────────────────────────────────────────┐
│ Demo Campaign                     🔄 Processing│
│ 8 Aralık 2025, 21:30 (TR time)              │
├─────────────────────────────────────────────┤
│ 👥 5    📧 3    ✅ 2    ❌ 1                │
│ Contacts  Sent   Success  Failed            │
├─────────────────────────────────────────────┤
│          [View Details]                      │
└─────────────────────────────────────────────┘
```

### Campaign Details Modal
```
┌─────────────────────────────────────────────┐
│ 📊 Campaign Details                     [X] │
├─────────────────────────────────────────────┤
│ 📋 Basic Information                        │
│ Campaign Name: Demo Campaign                │
│ Campaign ID: camp_1234567890_abc            │
│ Status: 🔄 Processing                       │
│ Created: 8 Aralık 2025, 21:30              │
├─────────────────────────────────────────────┤
│ 📧 Email Statistics                         │
│ [👥 5] [📧 3] [✅ 2] [❌ 1]                │
├─────────────────────────────────────────────┤
│ 👥 Contact List (5 contacts)               │
│ ┌──────────────────────────────────────┐   │
│ │ Name     Email        Company        │   │
│ │ Ali...   ali@...      AHS Bilisim   │   │
│ └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ 📄 CSV Preview                              │
│ name,email,company,position...              │
│ Ali Haktan SIGIN,ali@...                   │
├─────────────────────────────────────────────┤
│                                   [Close]   │
└─────────────────────────────────────────────┘
```

---

## 🐛 Sorun Giderme

### Campaign Listesi Görünmüyor
**Kontrol:**
- Firebase'e giriş yapıldı mı?
- Console'da hata var mı?
- `campaignManager` tanımlı mı?

**Çözüm:**
```javascript
// Console'da test edin
console.log(typeof campaignManager); // "object" olmalı
console.log(campaignManager.db); // Firestore instance
```

### Campaign Kaydedilmiyor
**Kontrol:**
- Firebase Auth çalışıyor mu?
- Firestore rules doğru mu?
- Console'da Firebase error var mı?

**Çözüm:**
- Firebase Console → Firestore → Rules → Yukarıdaki rules'u ekleyin

### Tarih TR Timezone Değil
**Kontrol:**
- `formatDate()` metodu `timeZone: 'Europe/Istanbul'` kullanıyor mu?

**Çözüm:**
- campaign-manager.js'de zaten düzeltildi ✅

### Modal Açılmıyor
**Kontrol:**
- `viewDetails()` çalışıyor mu?
- Campaign ID doğru mu?
- Lucide icons yüklü mü?

**Çözüm:**
```javascript
// Console'da test edin
campaignManager.viewDetails('camp_1234567890_abc');
```

---

## ✅ Başarı Kriterleri

- ✅ Campaign launch'tan sonra Firebase'e kaydediliyor
- ✅ Campaign listesi otomatik yenileniyor
- ✅ Contact listesi parse ediliyor ve kaydediliyor
- ✅ CSV data tam olarak kaydediliyor
- ✅ Tarihler TR timezone ile gösteriliyor
- ✅ Campaign details modal açılıyor
- ✅ Statistics doğru gösteriliyor
- ✅ Contact table render ediliyor
- ✅ CSV preview gösteriliyor

---

## 🎯 Sonuç

Artık user.html'de:
1. ✅ Campaign oluşturabilirsiniz
2. ✅ Campaign'ler Firebase'e kaydediliyor
3. ✅ Campaign listesini görebilirsiniz
4. ✅ Campaign detaylarını modal'da görebilirsiniz:
   - Contact listesi
   - CSV preview
   - Statistics
   - TR timezone tarihler

**Hazır! 🚀**
