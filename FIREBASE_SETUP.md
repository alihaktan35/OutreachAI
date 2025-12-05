# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your OutreachAI application.

## ✅ Already Configured!

Your Firebase project is already set up with the following credentials:
- **Project ID**: `outreachai-ahs`
- **Auth Domain**: `outreachai-ahs.firebaseapp.com`

## 🔐 Security Note

The Firebase credentials are stored in:
- `assets/js/firebase-config.js` - Contains actual credentials
- `.env` - Environment variables backup

**Both files are in `.gitignore` and will NOT be pushed to GitHub!**

## 📋 What You Need to Do in Firebase Console

### Step 1: Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **outreachai-ahs**
3. Go to **"Build" > "Authentication"**
4. Click **"Get started"** (if not already enabled)
5. Go to the **"Sign-in method"** tab

### Step 2: Enable Email/Password Authentication

1. Click on **"Email/Password"**
2. Toggle **"Enable"** (first toggle only)
3. **Do NOT enable** "Email link (passwordless sign-in)"
4. Click **"Save"**

### Step 3: Enable Google Authentication

1. Click on **"Google"**
2. Toggle **"Enable"**
3. Select your **Project support email** from dropdown
4. Click **"Save"**

### Step 4: Configure Authorized Domains

1. In Firebase Console, go to **"Authentication" > "Settings"**
2. Click on the **"Authorized domains"** tab
3. Make sure these domains are listed:
   - `localhost` (already there by default)
   - Your production domain when you deploy (add later)

### Step 5: Email Templates (Optional but Recommended)

Configure email templates for better branding:

1. Go to **"Authentication" > "Templates"**
2. Customize these templates:
   - **Password reset** - Email sent when user forgets password
   - **Email address verification** - For verifying new accounts
   - **Email address change** - When user changes email

Recommended customizations:
- Change "From name" to "OutreachAI"
- Update the email subject lines
- Customize the email body with your branding

## ✅ Testing Your Setup

1. Open `index.html` in your browser (use a local server)
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx http-server
   ```

2. Go to `http://localhost:8000/login.html`

3. Test the following:
   - **Email/Password Registration**: Create a new account
   - **Email/Password Login**: Sign in with your new account
   - **Google Login**: Click "Continue with Google"
   - **Password Reset**: Click "Forgot password?" and enter your email
   - **Logout**: Sign out from the main page (shows user menu when logged in)

## 🎯 Features Implemented

### ✅ Email/Password Authentication
- User registration with email and password
- User login with email and password
- Password validation (minimum 8 characters)
- Remember me functionality
- **Password reset via email** ("Forgot password?" link)
- Comprehensive error handling

### ✅ Google Sign-In
- One-click Google authentication
- Works for both login and registration
- Popup-based authentication flow
- Error handling for blocked popups

### ✅ Authentication State Management
- Automatic redirect if already logged in
- User menu with display name/email in navigation
- Logout functionality with redirect
- Session persistence across page reloads

### ✅ Security Features
- Firebase authentication tokens
- Secure password storage (handled by Firebase)
- Session management
- Protected routes
- **Credentials secured in .gitignore** (not pushed to GitHub)

## File Structure

```
OutreachAI/
├── assets/
│   └── js/
│       ├── config.js              # App configuration
│       └── firebase-config.js     # Firebase configuration (UPDATE THIS!)
├── index.html                     # Main landing page with auth state
├── login.html                     # Login/Register page
├── .env.example                   # Environment variables template
└── FIREBASE_SETUP.md             # This file
```

## ❗ Common Issues and Solutions

### Issue: "Firebase: Error (auth/operation-not-allowed)"
**Solution**: You haven't enabled the authentication method in Firebase Console. Go to Authentication > Sign-in method and enable Email/Password and Google.

### Issue: "Firebase: Error (auth/popup-blocked)"
**Solution**: Allow popups in your browser for Google authentication to work. Check your browser's address bar for blocked popup notification.

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your domain to the authorized domains list in Firebase Console (Authentication > Settings > Authorized domains).

### Issue: Password reset email not received
**Solution**:
1. Check spam/junk folder
2. Verify email templates are configured in Firebase Console
3. Make sure Email/Password authentication is enabled

## 🔒 Security Best Practices

### ✅ Already Implemented:
1. **Firebase credentials are in `.gitignore`** - They won't be pushed to GitHub
2. **Both `.env` and `firebase-config.js` are protected** from being committed

### Recommended for Production:
1. Use Firebase Security Rules to protect your Firestore data
2. Enable App Check for additional security against abuse
3. Set up proper CORS policies for your production domain
4. Consider enabling email verification for new accounts
5. Monitor authentication activity in Firebase Console

## 🚀 Quick Start Summary

### What's Already Done:
✅ Firebase project created (`outreachai-ahs`)
✅ Credentials configured and secured in `.gitignore`
✅ Login/Register pages ready with Email/Password + Google
✅ Password reset functionality implemented
✅ Authentication state management working
✅ User menu and logout functionality

### What You Need to Do:
1. Go to [Firebase Console](https://console.firebase.google.com/project/outreachai-ahs/authentication/providers)
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
4. Test your app at `http://localhost:8000/login.html`

That's it! 🎉

## 📚 Resources

- [Firebase Console - Your Project](https://console.firebase.google.com/project/outreachai-ahs)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)

---

**Created for OutreachAI** - AI-Powered Cold Outreach Automation
**Note**: GitHub login has been removed. Only Email/Password and Google authentication are supported.
