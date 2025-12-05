# 📧 OutreachAI

**AI-Powered Cold Outreach Email Automation Platform**

A modern, professional web application for automating B2B cold email outreach campaigns with intelligent personalization, automated follow-ups, and seamless CRM integration.

---

## 🎓 Project Information

- **Course**: ENGR 4451 - Computer Engineering Senior Project
- **Team Members**: Haktan, Özgür, Emre
- **Institution**: [Your University Name]
- **Year**: 2025

---

## 🚀 Features

### Authentication & User Management
- 🔐 **Firebase Authentication** - Email/Password and Google Sign-In
- 👤 **User Dashboard** - Professional dashboard with real-time statistics
- 💰 **Token Management** - Purchase and manage AI operation tokens
- 📊 **Real-time Updates** - Live token balance and package status via Firestore

### Core Functionality
- ✅ **AI-Powered Personalization** - Claude/Gemini AI generates personalized emails based on company research
- ✅ **Automated Sequences** - Multi-step follow-up campaigns with intelligent timing
- ✅ **Lead Generation** - Integration with Apollo.io and LinkedIn Sales Navigator
- ✅ **Smart Classification** - AI classifies email responses (interested/not interested/OOO)
- ✅ **CRM Sync** - Automatic synchronization with HubSpot, Pipedrive, and Salesforce
- ✅ **Deliverability Optimization** - Spam score checking and SPF/DKIM setup guidance

### Technical Features
- 🎨 Modern, responsive UI with smooth animations and dark mode
- 🔥 Firebase Firestore for real-time data management
- 🔌 n8n workflow automation integration
- 📱 Mobile-friendly responsive design
- 💳 Token-based pricing system with package management
- 🔒 Secure authentication with session persistence

---

## 📁 Project Structure

```
OutreachAI/
├── index.html                 # Main landing page
├── login.html                 # Authentication page
├── user.html                  # User dashboard
├── assets/
│   ├── css/
│   │   └── style.css         # Professional styling + dashboard styles
│   ├── js/
│   │   ├── config.js         # Application configuration
│   │   ├── main.js           # Landing page logic
│   │   ├── firebase-config.js # Firebase initialization (gitignored)
│   │   └── dashboard.js      # Dashboard functionality
│   └── images/               # Static assets
├── demo/                      # Google AI Studio prototype (gitignored)
├── .env                       # Environment variables (gitignored)
├── .env.example              # Environment variables template
├── FIREBASE_SETUP.md         # Firebase setup guide
├── FIRESTORE_SETUP.md        # Firestore database guide
├── TESTING_GUIDE.md          # Comprehensive testing guide
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🛠️ Setup & Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (free tier available)
- n8n instance (for workflow automation)
- Local web server for development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/alihaktan35/OutreachAI.git
   cd OutreachAI
   ```

2. **Setup Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password + Google)
   - Enable Firestore Database
   - See `FIREBASE_SETUP.md` for detailed instructions

3. **Configure Firebase credentials**
   - Copy your Firebase config
   - Update `assets/js/firebase-config.js` with your credentials
   - **Note:** This file is gitignored for security

4. **Start local server**
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Then open http://localhost:8000
   ```

5. **Create your first account**
   - Go to `http://localhost:8000/login.html`
   - Register with email/password or Google
   - You'll be redirected to the dashboard

---

## 🔌 n8n Integration

This application is designed to work with n8n workflow automation. You'll need to create three main workflows:

### 1. Launch Campaign Workflow
**Webhook URL**: `/webhook/launch-campaign`

**Input:**
```json
{
  "campaignId": "camp_1234567890_abc123",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "config": {
    "name": "Q4 SaaS Outreach",
    "targetAudience": "CTOs at Series A-C fintech startups",
    "valueProposition": "We help reduce cloud costs by 30%",
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

**Expected Actions:**
1. Generate leads from Apollo/LinkedIn
2. Research each company (AI)
3. Generate personalized emails (Claude/Gemini)
4. Send emails via SendGrid/Mailgun
5. Track opens/clicks
6. Schedule follow-ups
7. Sync interested leads to CRM

### 2. Check Status Workflow
**Webhook URL**: `/webhook/campaign-status`

**Query Parameter**: `campaignId`

**Expected Response:**
```json
{
  "campaignId": "camp_1234567890_abc123",
  "status": "active",
  "leads": 85,
  "emailsSent": 42,
  "totalLeads": 100,
  "progress": 42
}
```

### 3. Preview Email Workflow
**Webhook URL**: `/webhook/preview-email`

**Input:**
```json
{
  "targetAudience": "CTOs at fintech startups",
  "valueProposition": "We reduce cloud costs by 30%"
}
```

**Expected Response:**
```json
{
  "subject": "Quick question about [Company Name]",
  "body": "Hi [Name],\n\nI noticed that [Company]..."
}
```

---

## 🎨 Customization

### Styling
Edit `assets/css/style.css` to customize:
- Color scheme (CSS variables in `:root`)
- Typography
- Layout and spacing
- Responsive breakpoints

### Configuration
Edit `assets/js/config.js` to modify:
- n8n webhook URLs
- API endpoints
- Campaign limits
- Feature flags
- UI settings

### Content
Edit `index.html` to customize:
- Hero section text
- Features list
- Pricing tiers
- Footer information

---

## 🧪 Development Mode

The application automatically detects localhost and switches to mock mode:

```javascript
// In development, all API calls are mocked
if (window.location.hostname === 'localhost') {
    console.log('🔧 Running in development mode');
    // Mock data is returned instead of real API calls
}
```

This allows you to develop and test without a live n8n instance.

---

## 💰 Pricing & Tokens

Token-based pricing system for AI operations:

| Package | Price | Tokens | Features |
|---------|-------|--------|----------|
| **Starter** | $99/month | 5,000 | 200 contacts/campaign, 50 emails/day, AI personalization |
| **Professional** | $299/month | 20,000 | 1,000 contacts/campaign, 200 emails/day, Advanced AI, A/B testing |
| **Enterprise** | Custom | Unlimited | All features, white-label, custom integrations |

**What is a token?**
- 1 token = 1 AI operation (lead research, email generation, or response classification)

---

## 🔒 Compliance & Best Practices

### GDPR/KVKK Compliance
- ✅ Automatic opt-out handling
- ✅ Unsubscribe link in every email
- ✅ Data retention policies
- ✅ Privacy policy page

### Anti-Spam Best Practices
- ✅ SPF/DKIM/DMARC configuration
- ✅ Spam score checking before sending
- ✅ Automatic bounce handling
- ✅ Sending rate limits
- ✅ Warm-up sequences for new domains

---

## 🚢 Deployment

### GitHub Pages (Static Hosting)
```bash
# Already configured in this repo
# Just push to main branch
git push origin main
```

### Netlify
```bash
# Drag and drop the project folder to Netlify
# Or connect your GitHub repo
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Custom Server
Upload all files to your web server via FTP/SFTP.

---

## 🐛 Troubleshooting

### Authentication Issues
- **Can't login**: Verify Firebase Authentication is enabled
- **Redirect not working**: Check Firebase authorized domains
- **Google Sign-In blocked**: Allow popups in browser

### Database Issues
- **Data not saving**: Check Firestore security rules are published
- **Permission denied**: Verify user is authenticated
- **Tokens not updating**: Check browser console for Firestore errors

### Campaign Issues
- **Campaign not launching**: Check browser console for errors
- **No tokens**: Purchase a package from dashboard
- **Webhook errors**: Verify n8n webhook URLs in `config.js`

For detailed testing instructions, see `TESTING_GUIDE.md`

---

## 📚 Resources

### Documentation
- `FIREBASE_SETUP.md` - Complete Firebase setup guide
- `FIRESTORE_SETUP.md` - Database structure and security rules
- `TESTING_GUIDE.md` - Comprehensive testing instructions

### External Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Claude AI Documentation](https://docs.anthropic.com/)
- [Google Gemini API](https://ai.google.dev/docs)

---

## 🤝 Contributing

This is a university project, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is created for educational purposes as part of ENGR 4451 course requirements.

---

## 👥 Team

- **Ali Haktan** - Full-stack Development & Firebase Integration
- **Özgür** - n8n Workflow Integration
- **Emre** - Backend & API Integration

---

## 📞 Contact

For questions or support:
- GitHub: [@alihaktan35](https://github.com/alihaktan35)
- Project Repository: [OutreachAI](https://github.com/alihaktan35/OutreachAI)

---

## 🎯 Project Goals

As per course requirements, this project demonstrates:

1. ✅ **AI Integration** - Claude/Gemini for personalization and classification
2. ✅ **User Authentication** - Firebase Auth with Email/Password and Google Sign-In
3. ✅ **Real-time Database** - Firestore for user data and token management
4. ✅ **Workflow Automation** - n8n for complex multi-step sequences
5. ✅ **Modern Web Development** - Responsive design, clean architecture, dark mode
6. ✅ **Security** - Secure authentication, credential protection, security rules
7. ✅ **Production-Ready** - Scalable, maintainable, deployable solution

---

## 🏆 Current Implementation Status

- ✅ Landing page with pricing
- ✅ Authentication system (Email/Password + Google)
- ✅ User dashboard with real-time updates
- ✅ Token purchase system with confirmation modal
- ✅ Firestore database integration
- ✅ Responsive design with dark mode
- ⏳ Campaign creation (in progress)
- ⏳ Lead management (planned)
- ⏳ n8n workflow integration (planned)

---

**Built with ❤️ for ENGR 4451 by Team OutreachAI**
