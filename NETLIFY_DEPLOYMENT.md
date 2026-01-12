# Netlify Deployment Guide

## 🔐 Mixed Content Solution

This app uses **Netlify Functions** as a proxy to solve the Mixed Content issue (HTTPS → HTTP).

### The Problem
- **Netlify** serves your site over **HTTPS** (secure)
- **n8n webhooks** run on **HTTP** (not secure)
- Browsers block HTTP requests from HTTPS pages

### The Solution
```
Frontend (HTTPS) → Netlify Functions (HTTPS) → n8n (HTTP) ✓ Works!
```

## 📁 Project Structure

```
OutreachAI/
├── netlify/
│   └── functions/          # Serverless proxy functions
│       ├── ping.js
│       ├── create-draft.js
│       ├── send-mail.js
│       └── check-replies.js
├── netlify.toml            # Netlify configuration
├── package.json            # Node dependencies
└── assets/js/config.js     # Auto-detects environment
```

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Netlify Functions proxy"
git push origin main
```

### 2. Deploy to Netlify
- Go to [Netlify Dashboard](https://app.netlify.com)
- Click "Add new site" → "Import an existing project"
- Connect your GitHub repository
- Build settings:
  - **Build command:** (leave empty)
  - **Publish directory:** `.` (root)
  - **Functions directory:** `netlify/functions`
- Click "Deploy site"

### 3. Environment Variables (Optional)
You can add n8n URL as an environment variable:
- Go to Site settings → Environment variables
- Add: `N8N_URL` = `http://16.171.174.159:5678`

### 4. Test the Deployment
- Open your Netlify URL
- Check browser console for environment detection
- Test campaign creation and email sending

## 🔍 How It Works

### Localhost (Development)
```javascript
webhooks.ping = 'http://16.171.174.159:5678/webhook/ping'
```
Direct connection to n8n (HTTP allowed)

### Netlify (Production)
```javascript
webhooks.ping = '/.netlify/functions/ping'
```
Routes through serverless function (HTTPS → HTTP proxy)

### Automatic Detection
The `config.js` automatically detects:
```javascript
const isLocalhost = window.location.hostname === 'localhost';
// Uses appropriate webhook URLs based on environment
```

## 📊 Netlify Functions

Each function (`ping.js`, `send-mail.js`, etc.):
1. Receives HTTPS request from frontend
2. Forwards to n8n HTTP webhook
3. Returns response to frontend

### Example Function Structure:
```javascript
exports.handler = async (event) => {
  // Parse request
  const body = JSON.parse(event.body);

  // Forward to n8n
  const response = await fetch('http://n8n-url', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  // Return response
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  };
};
```

## 🛠 Troubleshooting

### Functions not working?
1. Check Netlify Functions logs: Site → Functions → View logs
2. Verify `package.json` has `node-fetch` dependency
3. Ensure `netlify.toml` points to correct functions directory

### Still seeing CORS errors?
1. Clear browser cache
2. Check that config.js is detecting Netlify correctly
3. Open console and check `window.location.hostname`

### n8n not responding?
1. Verify n8n server is running: `curl http://16.171.174.159:5678/webhook/ping`
2. Check EC2 instance security groups allow outbound HTTP
3. Verify n8n workflow is active

## 📝 Notes

- **Localhost:** Direct HTTP connection to n8n
- **Production:** Proxied through Netlify Functions (HTTPS)
- **No code changes needed** - environment auto-detected
- Functions are serverless and scale automatically

## 🔗 Useful Links

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Mixed Content MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
