# 📊 User Panel - Feature Guide

**Fully Functional User Dashboard for OutreachAI**

---

## ✅ Implemented Features

### 1. **Dark Mode** 🌙
- Toggle button in navbar
- Settings page theme selector (Auto/Light/Dark)
- Persists across sessions
- Smooth transitions

**How to use:**
- Click moon/sun icon in navbar to toggle
- Or go to Settings → Preferences → Theme dropdown

---

### 2. **Campaign Management** 📧

#### Create Campaign
- Click "New Campaign" or "Create First Campaign"
- Fill out the form:
  - Campaign Name
  - Target Audience (detailed description)
  - Value Proposition
  - Daily Email Limit (50/75/100)
  - Lead Source (Apollo/Snov.io/CSV/Manual)
  - Advanced Options (A/B testing, auto follow-up, spam check, CRM sync)

#### What Happens:
1. Validates form input
2. Checks if user has tokens
3. Saves campaign to Firestore (`campaigns` collection)
4. Sends data to n8n webhook (if configured)
5. Shows campaign status panel
6. Returns to campaigns list

**Firestore Structure:**
```javascript
{
  campaignId: "camp_1234567890_abc",
  userId: "user-uid",
  userEmail: "user@example.com",
  config: {
    name: "Q4 SaaS Outreach",
    targetAudience: "...",
    valueProposition: "...",
    emailLimit: 50,
    leadSource: "apollo"
  },
  options: {
    abTesting: false,
    autoFollowup: true,
    spamCheck: true,
    crmSync: true
  },
  status: "processing",
  leads: 0,
  emailsSent: 0,
  responses: {...}
}
```

---

### 3. **Leads Upload** 📤

#### Upload CSV
- Click "Upload CSV" button in Leads section
- View CSV format instructions
- Drag & drop or click to select CSV file
- Click "Process Leads"

#### CSV Format:
```csv
name,email,company,title,industry
John Doe,john@company.com,Acme Corp,CTO,fintech
Jane Smith,jane@startup.io,StartupIO,VP Eng,saas
```

**Required columns:**
- `email` (required)
- `name`, `company`, `title`, `industry` (optional)

#### What Happens:
1. Parses CSV file
2. Validates data
3. Saves to Firestore (`leads` collection)
4. Shows success message with count

**Firestore Structure:**
```javascript
{
  name: "John Doe",
  email: "john@company.com",
  company: "Acme Corp",
  title: "CTO",
  industry: "fintech",
  userId: "user-uid",
  status: "new",
  createdAt: Timestamp
}
```

---

### 4. **Settings** ⚙️

#### Account Information
- Update Display Name
- View Email (read-only)
- Saves to Firebase Auth profile + Firestore

#### Email Settings
- Sender Name (for outgoing emails)
- Sender Email (must be verified in SendGrid)
- Saves to Firestore

#### Preferences
- Email notifications toggle
- Weekly reports toggle
- Theme selector (Auto/Light/Dark)

**Firestore Structure:**
```javascript
{
  displayName: "John Doe",
  email: "john@example.com",
  emailSettings: {
    senderName: "John from Acme",
    senderEmail: "john@acme.com"
  }
}
```

---

### 5. **Token Management** 💰

#### Purchase Packages
- View current token balance
- See active package details
- Purchase new packages (demo mode - no real payment)
- Instant token credit

**Packages:**
- **Starter**: $99/mo - 5,000 tokens
- **Professional**: $299/mo - 20,000 tokens
- **Enterprise**: Custom - Unlimited tokens

---

### 6. **Analytics** 📊

- Currently shows empty state
- Ready for n8n integration
- Will display:
  - Campaign performance
  - Email open/click rates
  - Response classification
  - Conversion metrics

---

## 🎨 UI Improvements

### Compact Navbar
- Removed redundant navigation links
- Sidebar navigation is primary
- Cleaner, more professional look
- Theme toggle + logout button only

### Responsive Design
- Mobile-friendly forms
- Adaptive layouts
- Touch-optimized buttons

### Professional Styling
- Consistent spacing
- Smooth animations
- Clear visual hierarchy
- Accessible colors

---

## 🔗 n8n Integration Points

### 1. Campaign Launch
**Endpoint:** `POST /webhook/launch-campaign`

**Payload from User Panel:**
```javascript
{
  campaignId: "camp_...",
  userId: "user-uid",
  userEmail: "user@example.com",
  timestamp: "2025-01-06T...",
  config: {...},
  options: {...}
}
```

**Expected Response:**
```javascript
{
  success: true,
  campaignId: "camp_...",
  status: "processing",
  message: "Campaign launched successfully!"
}
```

### 2. Email Preview (Future)
**Endpoint:** `POST /webhook/preview-email`

**Payload:**
```javascript
{
  targetAudience: "...",
  valueProposition: "..."
}
```

**Expected Response:**
```javascript
{
  subject: "...",
  body: "..."
}
```

---

## 🧪 Testing the User Panel

### 1. Register & Login
```
http://localhost:8000/login.html
```
- Create new account or login
- You'll be redirected to user panel

### 2. Buy Tokens
- Go to Tokens section
- Click "Choose Plan" on any package
- Confirm purchase
- Check token balance updates

### 3. Create Campaign
- Go to Campaigns section
- Click "Create First Campaign"
- Fill out form
- Submit
- Check Firestore for new campaign document

### 4. Upload Leads
- Go to Leads section
- Click "Upload CSV"
- Create test CSV:
  ```csv
  name,email,company,title
  Test User,test@example.com,Test Corp,CTO
  ```
- Upload and process
- Check Firestore `leads` collection

### 5. Update Settings
- Go to Settings section
- Update Display Name
- Add Email Settings
- Change Theme preference
- Save and verify updates

### 6. Test Dark Mode
- Click theme toggle in navbar
- Or use Settings → Theme dropdown
- Reload page to verify persistence

---

## 📁 File Structure

```
OutreachAI/
├── user.html                  # User dashboard HTML (UPDATED)
├── assets/
│   ├── css/
│   │   └── style.css         # Updated with new styles
│   ├── js/
│   │   ├── dashboard.js      # All user panel logic (UPDATED)
│   │   ├── config.js         # n8n webhook URLs
│   │   └── firebase-config.js # Firebase credentials
└── USER_PANEL_GUIDE.md       # This file
```

---

## 🚀 Ready for n8n Integration

The user panel is **100% ready** for n8n integration. To connect:

1. **Get n8n webhook URLs** from Özgür
2. **Update `config.js`:**
   ```javascript
   webhooks: {
       launchCampaign: 'http://AWS_IP:5678/webhook/launch-campaign',
       // ...
   }
   ```
3. **Test campaign creation** - it will call the webhook
4. **n8n receives campaign data** and processes it

---

## ✨ Feature Summary

| Feature | Status | Firestore | n8n Ready |
|---------|--------|-----------|-----------|
| **Dark Mode** | ✅ Complete | N/A | N/A |
| **Campaign Creation** | ✅ Complete | ✅ | ✅ |
| **Leads Upload** | ✅ Complete | ✅ | N/A |
| **Settings** | ✅ Complete | ✅ | N/A |
| **Token Purchase** | ✅ Complete | ✅ | N/A |
| **Analytics** | 🔜 Empty State | N/A | ⏳ Waiting for n8n |

---

## 🎯 Next Steps

1. **Özgür:** Create n8n workflows and share webhook URLs
2. **Haktan:** Update `config.js` with webhook URLs
3. **Team:** Test end-to-end campaign flow
4. **Demo:** Show live campaign creation + n8n processing

---

**User Panel is fully functional and ready for demo! 🎉**
