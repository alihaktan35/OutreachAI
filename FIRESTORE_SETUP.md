# 🔥 Firestore Database Setup

This guide explains how to set up Firestore Database for OutreachAI user and token management.

## 📋 Steps to Enable Firestore

### 1. Go to Firebase Console

Visit: [Firebase Console - Firestore](https://console.firebase.google.com/project/outreachai-ahs/firestore)

### 2. Create Cloud Firestore Database

1. Click **"Create database"**
2. **Choose starting mode:**
   - Select **"Start in production mode"** (recommended)
   - Or **"Start in test mode"** (only for development)
3. **Select location:**
   - Choose a location closest to your users (e.g., `us-central`)
4. Click **"Enable"**

### 3. Set up Security Rules

After creating the database, go to the **"Rules"** tab and replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Campaigns collection - users can only access their own campaigns
    match /campaigns/{campaignId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Leads collection - users can only access their own leads
    match /leads/{leadId} {
      allow read, write: if request.auth != null &&
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **"Publish"** to save the rules.

## 📊 Database Structure

### Users Collection (`users`)

Each user document is stored with their UID as the document ID:

```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  tokens: 0,                    // Available AI tokens
  package: {
    name: "Professional",       // Package name
    price: 299,                 // Price paid
    tokens: 20000,             // Tokens included
    purchaseDate: "2025-01-...",
    paymentStatus: "paid"
  },
  activeCampaigns: 0,           // Number of active campaigns
  totalLeads: 0,                // Total leads generated
  emailsSent: 0,                // Total emails sent
  responseRate: 0,              // Response rate percentage
  createdAt: Timestamp,         // Account creation date
  lastPurchase: Timestamp       // Last package purchase date
}
```

### Campaigns Collection (`campaigns`)

```javascript
{
  campaignId: "camp_1704556800000_abc123",
  userId: "user_uid",
  userEmail: "user@example.com",
  timestamp: "2025-01-06T10:30:00.000Z",
  config: {
    name: "Q4 SaaS Outreach",
    targetAudience: "CTOs at Series A-C fintech startups",
    valueProposition: "We help reduce cloud costs by 30%",
    emailLimit: 50,
    leadSource: "apollo"
  },
  options: {
    abTesting: false,
    autoFollowup: true,
    spamCheck: true,
    crmSync: true
  },
  status: "processing",          // processing, active, paused, completed, failed
  leads: 0,
  emailsSent: 0,
  responses: {
    interested: 0,
    notInterested: 0,
    outOfOffice: 0,
    noResponse: 0
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Leads Collection (`leads`) - To be implemented

```javascript
{
  userId: "user_uid",
  campaignId: "campaign_id",
  name: "Jane Smith",
  email: "jane@company.com",
  company: "Company Inc",
  title: "VP of Engineering",
  industry: "fintech",
  status: "sent",               // pending, sent, opened, replied
  generatedEmail: "...",
  createdAt: Timestamp
}
```

## 🔒 Security Best Practices

1. **Always use Production Mode** for deployed applications
2. **Security rules are enforced** - users can only access their own data
3. **Authentication required** - all database operations require Firebase Auth
4. **Token validation** - verify tokens before operations in production

## 🧪 Testing the Setup

1. **Start your application:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Register a new user** at `http://localhost:8000/login.html`

3. **Check Firestore Console:**
   - Go to Firestore Database tab
   - You should see a new document in the `users` collection
   - Document ID = your user's UID

4. **Try purchasing a package:**
   - Go to Dashboard → Tokens
   - Click "Choose Plan" on any package
   - Check Firestore - tokens and package info should update

## 📊 Monitoring Usage

### View Database Activity

1. Go to **Firestore → Usage** tab
2. Monitor:
   - Document reads
   - Document writes
   - Document deletes
   - Storage usage

### Free Tier Limits

- **Stored data:** 1 GiB
- **Document reads:** 50,000/day
- **Document writes:** 20,000/day
- **Document deletes:** 20,000/day

For production, consider upgrading to Blaze (pay as you go) plan.

## 🔧 Optional: Indexes

As your app grows, you may need composite indexes for complex queries.

### Creating Indexes

1. Go to **Firestore → Indexes** tab
2. Click **"Create index"**
3. Common indexes you might need:
   - **Users by createdAt** (for admin dashboard)
   - **Campaigns by userId + status** (for filtering)
   - **Leads by campaignId + status** (for analytics)

The Firebase console will automatically suggest indexes when you run queries that need them.

## 🚀 Next Steps

After setting up Firestore:

1. ✅ Authentication enabled
2. ✅ Firestore database created
3. ✅ Security rules configured
4. ✅ User data structure ready
5. ⏭️ Test user registration and token purchase
6. ⏭️ Implement campaign creation
7. ⏭️ Add lead management
8. ⏭️ Build analytics dashboard

## 📚 Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Data Modeling Best Practices](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Pricing Calculator](https://firebase.google.com/pricing)

---

**OutreachAI** - User and token management powered by Firebase Firestore
