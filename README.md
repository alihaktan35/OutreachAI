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

### Core Functionality
- ✅ **AI-Powered Personalization** - Claude/Gemini AI generates personalized emails based on company research
- ✅ **Automated Sequences** - Multi-step follow-up campaigns with intelligent timing
- ✅ **Lead Generation** - Integration with Apollo.io and LinkedIn Sales Navigator
- ✅ **Smart Classification** - AI classifies email responses (interested/not interested/OOO)
- ✅ **CRM Sync** - Automatic synchronization with HubSpot, Pipedrive, and Salesforce
- ✅ **Deliverability Optimization** - Spam score checking and SPF/DKIM setup guidance

### Technical Features
- 🎨 Modern, responsive UI with smooth animations
- 🔌 n8n workflow automation integration
- 📊 Real-time campaign status tracking
- 📈 Campaign analytics and performance metrics
- 🔒 GDPR/KVKK compliant with automatic opt-out handling
- 📱 Mobile-friendly design

---

## 📁 Project Structure

```
OutreachAI/
├── index.html                 # Main landing page
├── assets/
│   ├── css/
│   │   └── style.css         # Professional styling
│   ├── js/
│   │   ├── config.js         # Configuration & environment
│   │   └── main.js           # Application logic
│   └── images/               # Static assets
├── demo/                      # Google AI Studio prototype (gitignored)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🛠️ Setup & Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- n8n instance (for workflow automation)
- Optional: Local web server for development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/OutreachAI.git
   cd OutreachAI
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual n8n webhook URLs and API keys
   ```

3. **Open in browser**
   - Simply open `index.html` in your browser, or
   - Use a local server:
     ```bash
     # Python 3
     python -m http.server 8000

     # Node.js (using npx)
     npx serve
     ```

4. **Configure n8n webhooks**
   - Update the webhook URLs in `assets/js/config.js`
   - Replace placeholder URLs with your actual n8n instance URLs

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

## 📊 Campaign Limits

Based on the project requirements:

| Tier | Max Contacts | Daily Email Limit | Features |
|------|--------------|-------------------|----------|
| **Starter** | 200 | 50-100 | Basic personalization |
| **Professional** | 1,000 | 200 | Advanced AI, A/B testing |
| **Enterprise** | Unlimited | Unlimited | White-label, custom integrations |

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

### Campaign not launching
- Check browser console for errors
- Verify n8n webhook URLs in `config.js`
- Ensure n8n workflows are active
- Check CORS settings on n8n instance

### Emails not sending
- Verify SendGrid/Mailgun API keys
- Check daily sending limits
- Review spam score results
- Ensure SPF/DKIM are configured

### Status not updating
- Check n8n workflow execution logs
- Verify webhook response format
- Check browser network tab for failed requests

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [SendGrid API](https://docs.sendgrid.com/)
- [Apollo.io API](https://apolloio.github.io/apollo-api-docs/)
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

- **Haktan** - Frontend Development
- **Özgür** - n8n Workflow Integration
- **Emre** - Backend & API Integration

---

## 📞 Contact

For questions or support, please contact:
- Email: [your-email@university.edu]
- GitHub: [your-github-username]

---

## 🎯 Project Goals

As per course requirements, this project demonstrates:

1. ✅ **AI Integration** - Claude/Gemini for personalization and classification
2. ✅ **Workflow Automation** - n8n for complex multi-step sequences
3. ✅ **API Integrations** - Apollo.io, SendGrid, LinkedIn, CRM platforms
4. ✅ **Modern Web Development** - Responsive design, clean architecture
5. ✅ **Compliance** - GDPR/KVKK awareness and anti-spam practices
6. ✅ **Production-Ready** - Scalable, maintainable, deployable solution

---

**Built with ❤️ for ENGR 4451 by Team OutreachAI**
