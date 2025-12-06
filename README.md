# 📧 OutreachAI

[![Netlify Status](https://api.netlify.com/api/v1/badges/e9f15ca1-0a45-439e-98ff-a172159d8004/deploy-status)](https://app.netlify.com/projects/outreachai/deploys)

**AI-Powered Cold Outreach Email Automation Platform**

A modern web application for automating B2B cold email outreach campaigns with intelligent personalization, automated follow-ups, and seamless CRM integration.

🔗 **Live Demo:** [outreachai.netlify.app](https://outreachai.netlify.app)

---

## 🎓 Course Project

- **Course:** ENGR 4451 - Generative AI for Engineers
- **Team:** Haktan, Özgür, Emre
- **Year:** 2025

---

## 🎯 Project Overview

OutreachAI is an all-in-one platform that replaces 5+ tools traditionally needed for cold email outreach:

1. **Lead Generation** (Apollo.io / Snov.io)
2. **AI Personalization** (Claude / Gemini)
3. **Email Delivery** (SendGrid / Mailgun)
4. **Response Tracking** (Mail tracking services)
5. **CRM Integration** (HubSpot / Pipedrive)

### Problem Statement

Traditional cold outreach requires:
- ❌ Manual lead research
- ❌ Generic, templated emails
- ❌ Separate tools for sending, tracking, and CRM
- ❌ Manual follow-up scheduling
- ❌ Poor deliverability due to spam filters

### Our Solution

OutreachAI automates the entire workflow:
- ✅ AI-powered lead generation from Apollo.io/LinkedIn
- ✅ Personalized email generation using Claude/Gemini AI
- ✅ Smart follow-up sequences with timing optimization
- ✅ Automatic response classification (interested/not interested/OOO)
- ✅ CRM auto-sync for qualified leads
- ✅ Spam score checking and deliverability optimization

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- HTML5, CSS3 (Custom design system)
- Vanilla JavaScript (No frameworks - lightweight)
- Firebase SDK (Authentication & Database)
- Lucide Icons

**Backend:**
- Firebase Authentication (Email/Password + Google Sign-In)
- Firestore (NoSQL Database)
- n8n (Workflow Automation)
- Cloud Functions (Future)

**Integrations:**
- **Lead Generation:** Apollo.io API / Snov.io API
- **AI Personalization:** Anthropic Claude API / Google Gemini API
- **Email Delivery:** SendGrid API / Mailgun API
- **Response Tracking:** Webhook-based open/click tracking
- **CRM Sync:** HubSpot API / Pipedrive API (via Make.com)

### System Flow

```
User Creates Campaign
    ↓
Firebase (Campaign Data Saved)
    ↓
n8n Workflow Triggered (Webhook)
    ↓
Apollo.io (Lead Generation)
    ↓
Claude AI (Email Personalization per lead)
    ↓
SendGrid (Email Delivery)
    ↓
Webhook Tracking (Opens/Clicks)
    ↓
AI Classification (Response Analysis)
    ↓
CRM Sync (Interested Leads)
    ↓
Dashboard Analytics (Real-time updates)
```

---

## 🚀 Key Features

### 1. AI-Powered Personalization
- Company research using web scraping + AI
- Context-aware email generation
- Dynamic merge tags (name, company, industry, etc.)
- Tone adaptation based on target audience

### 2. Multi-Step Email Sequences
- Automated follow-up scheduling (3-day intervals)
- A/B testing for subject lines
- Conditional logic (skip follow-up if replied)
- Engagement-based prioritization

### 3. Lead Generation
- Apollo.io integration (job titles, industries, locations)
- LinkedIn Sales Navigator import
- CSV upload for custom lists
- Automatic duplicate detection

### 4. Deliverability Optimization
- Spam score checking before sending (Mail Tester API)
- SPF/DKIM/DMARC configuration guide
- Sending rate limits (50-100 emails/day)
- Warm-up sequences for new domains
- Automatic bounce handling

### 5. Response Management
- AI-powered classification:
  - ✅ Interested (forward to CRM)
  - ❌ Not interested (auto-unsubscribe)
  - 📅 Out of office (reschedule follow-up)
  - ❓ Unclear (manual review)
- Automatic unsubscribe link in every email
- GDPR/KVKK compliance

### 6. Analytics Dashboard
- Campaign performance metrics
- Open rate, click rate, response rate
- Conversion tracking
- ROI calculations
- Export to CSV/PDF

---

## 🎨 User Interface

### Design System
- **Modern & Professional:** Clean, minimalist interface
- **Dark Mode:** Full dark theme support with persistence
- **Responsive:** Mobile-first design, works on all devices
- **Accessible:** WCAG 2.1 AA compliant, keyboard navigation

### Key Pages

**Landing Page:**
- Hero section with value proposition
- Feature showcase with icons
- Pricing comparison table
- Campaign creation form
- Dark mode toggle

**Authentication:**
- Email/Password signup
- Google Sign-In (Firebase)
- Session persistence
- Password reset flow

**User Dashboard:**
- Overview with key metrics
- Campaign management (create, edit, pause)
- Leads database (upload CSV, view details)
- Analytics charts
- Settings (account, email preferences)
- Token management (demo pricing)

---

## 📊 Database Schema

### Firestore Collections

**users:**
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  tokens: 20000,
  package: {
    name: "Professional",
    price: 299,
    tokens: 20000,
    purchaseDate: "2025-01-06",
    paymentStatus: "paid"
  },
  emailSettings: {
    senderName: "John from Acme",
    senderEmail: "john@acme.com"
  },
  createdAt: Timestamp
}
```

**campaigns:**
```javascript
{
  campaignId: "camp_1704556800000_abc",
  userId: "user-uid",
  config: {
    name: "Q4 SaaS Outreach",
    targetAudience: "CTOs at Series A-C fintech startups",
    valueProposition: "Reduce cloud costs by 30%",
    emailLimit: 50,
    leadSource: "apollo"
  },
  options: {
    abTesting: false,
    autoFollowup: true,
    spamCheck: true,
    crmSync: true
  },
  status: "active", // processing, active, paused, completed
  leads: 85,
  emailsSent: 42,
  responses: {
    interested: 5,
    notInterested: 2,
    outOfOffice: 1,
    noResponse: 34
  },
  createdAt: Timestamp
}
```

**leads:**
```javascript
{
  userId: "user-uid",
  campaignId: "camp_id",
  name: "Jane Smith",
  email: "jane@company.com",
  company: "Company Inc",
  title: "VP of Engineering",
  industry: "fintech",
  status: "sent", // pending, sent, opened, replied
  emailSent: Timestamp,
  lastActivity: Timestamp
}
```

---

## 🔧 n8n Workflow Integration

### Webhook Endpoints

**1. Launch Campaign** (`POST /webhook/launch-campaign`)

Receives campaign data from frontend, triggers automation:

```javascript
// Input
{
  campaignId: "camp_123",
  userId: "user-uid",
  config: { /* campaign settings */ },
  options: { /* feature flags */ }
}

// n8n Workflow Steps:
1. Apollo.io → Fetch leads based on target audience
2. Loop through leads:
   - Research company (web scraping)
   - Claude AI → Generate personalized email
   - Mail Tester → Check spam score
   - SendGrid → Send email
   - Delay → Rate limiting
3. Update Firestore → Campaign stats
4. Return success response
```

**2. Campaign Status** (`GET /webhook/campaign-status?campaignId=camp_123`)

Returns real-time campaign progress for dashboard polling.

**3. Email Preview** (`POST /webhook/preview-email`)

Generates sample email using AI for user preview before launching.

---

## 🔐 Security & Compliance

### Security Measures
- ✅ Firebase Authentication (secure token-based auth)
- ✅ Firestore Security Rules (user-scoped data access)
- ✅ HTTPS enforcement (via Netlify)
- ✅ XSS protection (no innerHTML with user data)
- ✅ Input validation (form validation + server-side)
- ✅ API keys in environment variables (not in code)

### Compliance
- ✅ **GDPR Compliance:**
  - Automatic opt-out handling
  - Unsubscribe link in every email
  - Data deletion on request
  - Privacy policy page

- ✅ **KVKK Compliance:**
  - User consent for data processing
  - Clear data usage policy
  - Right to access/delete data

- ✅ **CAN-SPAM Act:**
  - Physical address in emails
  - Clear unsubscribe mechanism
  - Honest subject lines
  - No false sender information

---

## 📈 Project Scope

### Current Implementation (Demo)

**Limits:**
- Maximum 200 contacts per campaign
- Daily sending limit: 50-100 emails
- Basic AI personalization (template variables)
- Free tier APIs (Apollo, SendGrid)

**Test Use Case:**
Departmental sponsorship outreach for ENGR 4451 project funding

### Future Enhancements

**Phase 2:**
- Chrome extension for LinkedIn profile scraping
- Advanced A/B testing dashboard
- Predictive response scoring (ML model)
- Multi-language support

**Phase 3:**
- White-label solution for agencies
- Custom email templates builder
- Advanced analytics (heatmaps, engagement trends)
- Integration marketplace

---

## 📚 Technical Documentation

- **Firebase Setup:** `FIREBASE_SETUP.md`
- **Firestore Schema:** `FIRESTORE_SETUP.md`
- **n8n Workflows:** `N8N_INTEGRATION_GUIDE.md`

---

## 🎯 Learning Outcomes

This project demonstrates:

1. **AI Integration:** Using Claude/Gemini for personalization
2. **Cloud Architecture:** Firebase (Auth, Database, Hosting)
3. **Workflow Automation:** n8n for complex multi-step processes
4. **API Integration:** Apollo, SendGrid, Claude, HubSpot
5. **Modern Web Development:** Responsive SPA, dark mode, accessibility
6. **Security Best Practices:** Auth, data protection, compliance
7. **Database Design:** NoSQL schema, real-time listeners
8. **Production Deployment:** Netlify, custom domain, HTTPS

---

## 👥 Team Contributions

**Ali Haktan:**
- Frontend development (HTML/CSS/JS)
- Firebase integration (Auth + Firestore)
- User dashboard & settings
- Dark mode implementation
- Deployment & hosting

**Özgür:**
- n8n workflow design & implementation
- API integrations (Apollo, SendGrid, Claude)
- Webhook endpoints
- Campaign automation logic
- AWS infrastructure

**Emre:**
- Backend API coordination
- External service credentials management
- Email deliverability optimization
- CRM integration (HubSpot/Pipedrive)
- Testing & QA

---

## 📞 Contact

**Repository:** [OutreachAI](https://github.com/alihaktan35/OutreachAI)

---

## 📄 License

This project is created for educational purposes as part of ENGR 4451 course requirements.

---

**Built with ❤️ for ENGR 4451 - Generative AI for Engineers**