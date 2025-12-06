# 🔗 n8n Integration Guide for OutreachAI

This guide explains how to connect your OutreachAI web app to your n8n automation workflow running on AWS.

---

## 📋 Overview

Your OutreachAI app sends campaign data from the website to n8n webhooks, which then:
1. Generate leads from Apollo.io or Snov.io
2. Personalize emails using Claude/Gemini AI
3. Send emails via SendGrid
4. Track responses and schedule follow-ups

---

## 🔧 Step 1: Update Webhook URLs

Your team needs to update the webhook URLs in `assets/js/config.js`:

```javascript
const CONFIG = {
    webhooks: {
        // Replace these with your actual AWS n8n webhook URLs
        launchCampaign: 'https://YOUR_AWS_N8N_IP:5678/webhook/launch-campaign',
        checkStatus: 'https://YOUR_AWS_N8N_IP:5678/webhook/campaign-status',
        previewEmail: 'https://YOUR_AWS_N8N_IP:5678/webhook/preview-email',
    },
    // ... rest of config
};
```

**How to get your n8n webhook URL:**
1. Open your n8n workflow on AWS
2. Add a "Webhook" node
3. Set the path (e.g., `/launch-campaign`)
4. Copy the "Production URL"
5. Paste it into `config.js`

---

## 📤 Step 2: Campaign Launch Workflow

When a user launches a campaign from `index.html` or `user.html`, the app sends this JSON to your n8n webhook:

### **Webhook Endpoint:** `POST /webhook/launch-campaign`

### **Request Payload:**
```json
{
  "campaignId": "camp_1704556800000_abc123",
  "timestamp": "2025-01-06T10:30:00.000Z",
  "userId": "firebase-user-id-here",
  "userEmail": "user@example.com",
  "config": {
    "name": "Q4 SaaS Outreach",
    "targetAudience": "CTOs and VP of Engineering at Series A-C fintech startups in North America",
    "valueProposition": "We help fintech companies reduce cloud infrastructure costs by 30% using AI-powered optimization.",
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

### **Expected n8n Response:**
```json
{
  "success": true,
  "campaignId": "camp_1704556800000_abc123",
  "status": "processing",
  "message": "Campaign launched successfully!",
  "estimatedLeads": 50
}
```

### **n8n Workflow Steps:**

1. **Webhook Trigger** → Receive campaign data
2. **Function Node** → Extract `targetAudience` and `leadSource`
3. **IF Node** → Check `leadSource`:
   - If `apollo` → Use Apollo.io API
   - If `linkedin` → Use LinkedIn Sales Navigator API
   - If `csv` → Parse uploaded CSV (future feature)
4. **Apollo/Snov.io Node** → Generate leads
5. **Loop Node** → For each lead:
   - **HTTP Request** → Research company (Claude API or web search)
   - **Claude AI Node** → Generate personalized email
   - **IF Node** → Check `spamCheck` option
   - **Mail Tester API** → Validate spam score (if enabled)
   - **SendGrid Node** → Send email
   - **Delay Node** → Wait between sends (rate limiting)
6. **Firestore Node** → Update campaign stats in Firebase
7. **Webhook Response** → Return success

---

## 📊 Step 3: Status Check Workflow

The dashboard polls this endpoint every 5 seconds to check campaign progress.

### **Webhook Endpoint:** `GET /webhook/campaign-status?campaignId=camp_123`

### **Request Parameters:**
- `campaignId` (required): The campaign ID to check

### **Expected n8n Response:**
```json
{
  "campaignId": "camp_1704556800000_abc123",
  "status": "active",
  "leads": 85,
  "emailsSent": 42,
  "totalLeads": 100,
  "progress": 42,
  "responses": {
    "interested": 5,
    "notInterested": 2,
    "outOfOffice": 1,
    "noResponse": 34
  }
}
```

### **n8n Workflow Steps:**

1. **Webhook Trigger** → Receive `campaignId`
2. **Firestore/Database Query** → Get campaign status from storage
3. **Function Node** → Calculate progress percentage
4. **Webhook Response** → Return status JSON

---

## 👁️ Step 4: Email Preview Workflow

When users click "Preview Email", the app generates a sample email.

### **Webhook Endpoint:** `POST /webhook/preview-email`

### **Request Payload:**
```json
{
  "targetAudience": "CTOs at Series A-C fintech startups",
  "valueProposition": "We help reduce cloud infrastructure costs by 30% using AI-powered optimization"
}
```

### **Expected n8n Response:**
```json
{
  "subject": "Quick question about reducing cloud costs at [Company Name]",
  "body": "Hi [First Name],\n\nI noticed that [Company Name] recently raised a Series A and is likely scaling infrastructure rapidly.\n\nWe help fintech companies like yours reduce cloud costs by 30% using AI-powered optimization.\n\nWould you be open to a quick 15-minute chat next week to explore if this could help [Company Name]?\n\nBest regards,\n[Your Name]"
}
```

### **n8n Workflow Steps:**

1. **Webhook Trigger** → Receive target audience and value prop
2. **Claude AI Node** → Generate email with prompt:
   ```
   Generate a cold outreach email for:
   Target: {targetAudience}
   Value Prop: {valueProposition}

   Requirements:
   - Personalized subject line
   - 3-4 sentences max
   - Clear call to action
   - Use merge tags like [Company Name], [First Name]
   ```
3. **Webhook Response** → Return subject + body

---

## 🔐 Step 5: Apollo.io Integration

Your n8n workflow needs Apollo.io API credentials.

### **How to Setup:**

1. **Get Apollo API Key:**
   - Go to [Apollo.io](https://app.apollo.io/)
   - Navigate to Settings → API
   - Copy your API key

2. **In n8n:**
   - Add "HTTP Request" node
   - Set method to `POST`
   - URL: `https://api.apollo.io/v1/mixed_people/search`
   - Headers:
     ```json
     {
       "Content-Type": "application/json",
       "X-Api-Key": "YOUR_APOLLO_API_KEY"
     }
     ```
   - Body:
     ```json
     {
       "q_keywords": "{{$json.config.targetAudience}}",
       "page": 1,
       "per_page": 50
     }
     ```

3. **Parse Response:**
   - Apollo returns leads with `name`, `email`, `company`, `title`
   - Use "Function" node to format data

### **Alternative: Snov.io Integration**

If using Snov.io instead:

1. **Get Snov.io API Credentials:**
   - Go to [Snov.io](https://snov.io/)
   - Settings → API → Get Client ID + Secret

2. **In n8n:**
   - Add "HTTP Request" node
   - URL: `https://api.snov.io/v1/get-prospects-list`
   - Auth: Basic Auth (Client ID:Secret)
   - Body:
     ```json
     {
       "search": "{{$json.config.targetAudience}}",
       "limit": 50
     }
     ```

---

## 📧 Step 6: SendGrid Integration

Your n8n workflow sends emails via SendGrid.

### **How to Setup:**

1. **Get SendGrid API Key:**
   - Go to [SendGrid](https://sendgrid.com/)
   - Settings → API Keys → Create API Key
   - Copy the key (starts with `SG.`)

2. **In n8n:**
   - Add "SendGrid" node (built-in)
   - Configure credentials:
     - API Key: `YOUR_SENDGRID_API_KEY`
   - Email settings:
     ```javascript
     From: {{$json.userEmail}} // User's email from Firebase
     To: {{$json.lead.email}}
     Subject: {{$json.generatedEmail.subject}}
     Content: {{$json.generatedEmail.body}}
     ```

3. **Add Tracking:**
   - Enable "Click Tracking" in SendGrid node
   - Enable "Open Tracking"
   - Use webhook to receive events

### **SendGrid Webhook for Opens/Clicks:**

1. In SendGrid Dashboard:
   - Settings → Mail Settings → Event Webhook
   - URL: `https://YOUR_AWS_N8N_IP:5678/webhook/email-events`
   - Select events: `open`, `click`, `bounce`, `dropped`

2. In n8n:
   - Create new workflow with Webhook trigger
   - Parse SendGrid event data
   - Update campaign stats in Firestore

---

## 🔄 Step 7: CRM Sync (Optional)

If `crmSync` option is enabled, sync interested leads to CRM.

### **HubSpot Integration:**

1. **Get HubSpot API Key:**
   - Settings → Integrations → API Key

2. **In n8n:**
   - Add "HubSpot" node
   - Action: "Create Contact"
   - Map fields:
     ```javascript
     email: {{$json.lead.email}}
     firstname: {{$json.lead.firstName}}
     lastname: {{$json.lead.lastName}}
     company: {{$json.lead.company}}
     ```

### **Pipedrive Integration:**

1. **Get Pipedrive API Token:**
   - Settings → API → Your Token

2. **In n8n:**
   - Add "Pipedrive" node
   - Action: "Create Person"
   - Map fields similar to HubSpot

---

## 🧪 Step 8: Testing the Integration

### **Test Campaign Launch:**

1. Open your browser console on `index.html`
2. Fill out the campaign form
3. Click "Launch Campaign"
4. Check browser console for:
   ```
   📤 Launching campaign (MOCK): {...}
   ```
5. Once you update `config.js` with real webhook URLs, you'll see:
   ```
   ✅ Campaign launched successfully!
   ```

### **Test with curl:**

```bash
curl -X POST https://YOUR_AWS_N8N_IP:5678/webhook/launch-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "test_123",
    "timestamp": "2025-01-06T10:30:00.000Z",
    "config": {
      "name": "Test Campaign",
      "targetAudience": "CTOs at fintech startups",
      "valueProposition": "Test value prop",
      "emailLimit": 10,
      "leadSource": "apollo"
    },
    "options": {
      "abTesting": false,
      "autoFollowup": true,
      "spamCheck": true,
      "crmSync": false
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "campaignId": "test_123",
  "status": "processing",
  "message": "Campaign launched successfully!"
}
```

---

## 🔑 Environment Variables for n8n

Create a `.env` file in your n8n project with these credentials:

```env
# Apollo.io
APOLLO_API_KEY=your_apollo_key_here

# Snov.io (if using instead of Apollo)
SNOV_CLIENT_ID=your_snov_client_id
SNOV_CLIENT_SECRET=your_snov_client_secret

# SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_key_here

# Claude AI (for email generation)
ANTHROPIC_API_KEY=sk-ant-your_claude_key_here

# Gemini AI (alternative to Claude)
GOOGLE_AI_API_KEY=your_gemini_key_here

# HubSpot (optional)
HUBSPOT_API_KEY=your_hubspot_key_here

# Pipedrive (optional)
PIPEDRIVE_API_TOKEN=your_pipedrive_token_here

# Firebase Admin (for updating Firestore from n8n)
FIREBASE_PROJECT_ID=outreachai-ahs
FIREBASE_PRIVATE_KEY=your_firebase_private_key_here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@outreachai-ahs.iam.gserviceaccount.com
```

---

## 📋 Checklist for Your Team

### **Frontend (Bu proje - Haktan)**
- [x] Landing page with campaign form
- [x] User authentication
- [x] Token management system
- [ ] Update `config.js` with real n8n webhook URLs (AWS IP'nizi ekleyin)
- [ ] Test campaign launch to n8n

### **n8n Workflows (Özgür)**
- [ ] Create `/webhook/launch-campaign` workflow
- [ ] Create `/webhook/campaign-status` workflow
- [ ] Create `/webhook/preview-email` workflow
- [ ] Integrate Apollo.io API
- [ ] Integrate SendGrid API
- [ ] Add Claude/Gemini AI for email generation
- [ ] Setup Firebase Admin SDK for Firestore updates
- [ ] Add error handling and logging

### **Backend/API Keys (Emre)**
- [ ] Get Apollo.io API key
- [ ] Get SendGrid API key
- [ ] Get Claude/Gemini API key
- [ ] Setup Firebase Admin SDK credentials
- [ ] Configure environment variables in n8n
- [ ] Test API integrations

---

## 🚀 Quick Start Checklist

1. **Get n8n webhook URL from AWS instance**
2. **Update `assets/js/config.js`** with webhook URLs
3. **Create n8n workflows** following the examples above
4. **Add API credentials** to n8n environment
5. **Test with a real campaign** from the website

---

## 🐛 Troubleshooting

### **Campaign not launching:**
- Check browser console for errors
- Verify webhook URLs are correct in `config.js`
- Test webhook with curl to ensure n8n is responding

### **No leads generated:**
- Check Apollo/Snov.io API credentials in n8n
- Verify API quota is not exceeded
- Check n8n execution logs for errors

### **Emails not sending:**
- Verify SendGrid API key is valid
- Check SendGrid sender verification (must verify email/domain)
- Check daily sending limits

### **CORS errors:**
- Add CORS headers in n8n webhook response:
  ```json
  {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  }
  ```

---

## 📞 Support

For questions about this integration:
- **Frontend issues:** Contact Haktan
- **n8n workflow issues:** Contact Özgür
- **API/Backend issues:** Contact Emre

---

**Good luck with your demo! 🎉**
