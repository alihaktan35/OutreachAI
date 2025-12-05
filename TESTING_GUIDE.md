# 🧪 OutreachAI Testing Guide

Complete guide for testing all features of the application.

## 🚀 Starting the Application

```bash
# Navigate to project directory
cd /Users/ahs/Documents/GitHub/OutreachAI

# Start local server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000
```

## ✅ Test Checklist

### 1. Authentication Tests

#### Test 1.1: User Registration
1. Go to `http://localhost:8000/login.html`
2. Click **"Register"** tab
3. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test123456`
   - Check "I agree to Terms"
4. Click **"Create Account"**
5. ✅ Should redirect to `user.html`
6. ✅ Check Firebase Console → Authentication → Users (new user should appear)

#### Test 1.2: Email/Password Login
1. Go to `http://localhost:8000/login.html`
2. Fill in:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Check "Remember me" (optional)
3. Click **"Sign In"**
4. ✅ Should redirect to `user.html`
5. ✅ Check navbar - should show "User Panel" button

#### Test 1.3: Google Sign-In
1. Go to `http://localhost:8000/login.html`
2. Click **"Continue with Google"**
3. Select your Google account
4. ✅ Should redirect to `user.html`
5. ✅ Display name should show in navbar

#### Test 1.4: Forgot Password
1. Go to `http://localhost:8000/login.html`
2. Enter an email address
3. Click **"Forgot password?"**
4. ✅ Should show "Password reset email sent!" toast
5. ✅ Check email inbox for reset link

#### Test 1.5: Already Logged In
1. Login to the app
2. Try to visit `http://localhost:8000/login.html`
3. ✅ Should auto-redirect to `user.html`

### 2. Dashboard Tests

#### Test 2.1: Initial Dashboard View
1. Login to app → redirects to `user.html`
2. Check sidebar shows:
   - ✅ Token Balance = 0
   - ✅ "No active package"
   - ✅ Menu items (Overview, Campaigns, Leads, etc.)
3. Check stats cards:
   - ✅ Active Campaigns = 0
   - ✅ Total Leads = 0
   - ✅ Emails Sent = 0
   - ✅ Response Rate = 0%
4. Check Quick Actions section displays
5. Check Recent Activity shows empty state

#### Test 2.2: Navigation Between Sections
1. Click **"Tokens"** in sidebar
2. ✅ Should show Token Management section
3. Click **"Overview"** in sidebar
4. ✅ Should return to Overview section
5. Click **"Campaigns"** in sidebar
6. ✅ Should show Campaigns section with empty state

#### Test 2.3: Firebase Database Check
1. Go to [Firestore Console](https://console.firebase.google.com/project/outreachai-ahs/firestore)
2. Expand `users` collection
3. Find your user document (by UID)
4. ✅ Should have:
   - `email`: your email
   - `displayName`: your name
   - `tokens`: 0
   - `package`: null
   - `activeCampaigns`: 0
   - `totalLeads`: 0
   - `emailsSent`: 0
   - `responseRate`: 0
   - `createdAt`: timestamp

### 3. Token Purchase Tests

#### Test 3.1: View Package Options
1. Login and go to Dashboard
2. Click **"Tokens"** in sidebar (or "Buy Tokens" button)
3. ✅ Should show 3 pricing cards:
   - **Starter**: $99/month - 5,000 tokens
   - **Professional**: $299/month - 20,000 tokens
   - **Enterprise**: Custom - Unlimited tokens

#### Test 3.2: Purchase Starter Package
1. In Tokens section, click **"Choose Plan"** on Starter card
2. ✅ Modern confirmation modal should appear
3. Check modal content:
   - ✅ Title: "Confirm Purchase"
   - ✅ Package badge: "Starter"
   - ✅ Price: $99/month
   - ✅ Features list displayed
   - ✅ Token amount: "5,000 tokens"
   - ✅ Note about test purchase shown
4. Click **"Cancel"**
5. ✅ Modal should close without changes

#### Test 3.3: Confirm Purchase
1. Click **"Choose Plan"** on Professional package
2. In modal, click **"Confirm Purchase"**
3. ✅ Button should show loading spinner
4. ✅ After 1.5 seconds, modal closes
5. ✅ Success toast: "Successfully purchased professional package! 20,000 tokens added"
6. ✅ Should navigate to Overview section
7. Check sidebar:
   - ✅ Token Balance = 20,000
   - ✅ Current Package = "Professional"
8. Go to Tokens section:
   - ✅ Package Name = "Professional"
   - ✅ Purchase Date = today's date
   - ✅ Payment Status = green "Paid" badge
   - ✅ Token Balance = 20,000

#### Test 3.4: Verify in Firestore
1. Go to [Firestore Console](https://console.firebase.google.com/project/outreachai-ahs/firestore)
2. Open your user document
3. ✅ `tokens`: 20000
4. ✅ `package`:
   ```javascript
   {
     name: "Professional",
     price: 299,
     tokens: 20000,
     purchaseDate: "2025-12-...",
     paymentStatus: "paid"
   }
   ```
5. ✅ `lastPurchase`: timestamp

#### Test 3.5: Multiple Purchases
1. Purchase another package (e.g., Starter - 5,000 tokens)
2. ✅ Token balance should increase to 25,000
3. ✅ Package info should update to latest purchase
4. Check Firestore:
   - ✅ `tokens`: 25000
   - ✅ `package`: updated to Starter

#### Test 3.6: Modal Interactions
**Test ESC key:**
1. Open purchase modal
2. Press `ESC` key
3. ✅ Modal should close

**Test overlay click:**
1. Open purchase modal
2. Click outside modal (on dark overlay)
3. ✅ Modal should close

**Test close button:**
1. Open purchase modal
2. Click X button in top-right
3. ✅ Modal should close

### 4. User Panel Access Tests

#### Test 4.1: User Panel from Index.html
1. Login to app
2. Go to `http://localhost:8000/index.html`
3. Check navbar:
   - ✅ Should show **"User Panel"** button (orange/primary)
   - ✅ Should show **"Logout"** button (gray/secondary)
   - ✅ Both buttons same height as theme toggle
4. Click **"User Panel"**
5. ✅ Should navigate to `user.html`

#### Test 4.2: Hero CTA for Logged-in Users
1. Login and go to `index.html`
2. Check hero section
3. ✅ Main CTA button should say **"Go to Dashboard"** (not "Start Free Campaign")
4. Click the button
5. ✅ Should navigate to `user.html`

### 5. Logout Tests

#### Test 5.1: Logout from Dashboard
1. Login and go to `user.html`
2. Click **"Logout"** button in navbar
3. ✅ Success toast: "Logged out successfully"
4. ✅ Should redirect to `index.html`
5. ✅ Navbar should show "Login" and "Get Started" buttons

#### Test 5.2: Logout from Index.html
1. Login to app
2. Go to `index.html`
3. Click **"Logout"** button
4. ✅ Should logout and refresh page
5. ✅ Navbar buttons should revert to guest state

### 6. Responsive Design Tests

#### Test 6.1: Mobile View (< 768px)
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Test all sections:
   - ✅ Sidebar becomes horizontal/stacked
   - ✅ Stats grid becomes single column
   - ✅ Quick actions become 2 columns
   - ✅ Pricing cards stack vertically
   - ✅ Modal fits screen properly

#### Test 6.2: Tablet View (768px - 1024px)
1. Resize browser to ~800px width
2. ✅ Sidebar narrower but functional
3. ✅ All sections remain usable
4. ✅ Modal properly centered

### 7. Theme Toggle Tests

#### Test 7.1: Dark Mode
1. Login to dashboard
2. Click moon/sun icon in navbar
3. ✅ Should switch to dark theme
4. ✅ All colors should invert properly
5. ✅ Modal should also use dark theme
6. ✅ Preference should persist on reload

#### Test 7.2: Theme Consistency
1. Enable dark mode
2. Navigate between sections
3. ✅ Theme should remain dark
4. Open purchase modal
5. ✅ Modal should be dark themed

### 8. Error Handling Tests

#### Test 8.1: Network Error Simulation
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to purchase a package
4. ✅ Should show error toast
5. ✅ Database should not update

#### Test 8.2: Invalid Data
1. Try to create campaign with 0 tokens
2. ✅ Should show warning: "You need tokens to create a campaign"
3. ✅ Should navigate to Tokens section

## 🎯 Expected Results Summary

After all tests:
- ✅ Authentication works (Email/Password + Google)
- ✅ Dashboard displays correctly
- ✅ Token purchase flow works
- ✅ Confirmation modal appears and functions
- ✅ Firestore updates correctly
- ✅ Navigation works between sections
- ✅ User Panel accessible from index.html
- ✅ Logout works from both pages
- ✅ Responsive on all screen sizes
- ✅ Dark mode works
- ✅ All buttons same height

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't appear
**Solution**: Check browser console for errors, refresh page with Ctrl+F5

### Issue: Firestore permission denied
**Solution**: Check security rules are published correctly

### Issue: Tokens don't update
**Solution**: Check Firestore Console for actual values, may be display issue

### Issue: Can't login
**Solution**: Verify Authentication is enabled in Firebase Console

## 📊 Monitoring

### Check Firebase Usage
1. Go to Firebase Console
2. **Authentication → Users**: Monitor user count
3. **Firestore → Usage**: Check read/write operations
4. **Firestore → Data**: View actual stored data

### Browser Console
Always keep browser console open (F12) to see:
- ✅ Success logs
- ❌ Error messages
- 🔵 Info messages

---

**Ready to test!** Start with Test 1.1 and work through each section systematically.
