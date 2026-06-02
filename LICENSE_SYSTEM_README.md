# 🔐 LiquidGold AI - License Management System

Complete server-based license management for XAUUSD Scalping AI V15.

## 📋 Overview

This system allows you to:
- ✅ Manage AI access with one-time payment + PIN verification
- ✅ Disable/suspend licenses instantly
- ✅ Set custom expiry dates per user
- ✅ Monitor all user activity
- ✅ Extend licenses on demand
- ✅ One file (.ex5) accessed by many users securely

## 🏗️ Architecture

```
User Payment
    ↓
Payment Verification
    ↓
License Created (Supabase)
    ↓
User Downloads .ex5
    ↓
EA Checks License (Startup)
    ↓
Trading Enabled/Disabled
```

## 📁 Files Included

### 1. Database Schema (`supabase/schema.sql`)
- 5 tables for complete license management
- RLS policies for security
- Helper functions for license operations
- Audit trail logging

### 2. API Backend (`api/licenses.js`)
- **10 endpoints** for full license management
- Runs on Vercel (FREE tier)
- Secure admin key validation
- Activity logging

### 3. Admin Dashboard (`admin-dashboard.html`)
- Beautiful dark UI
- Real-time statistics
- Search & filter licenses
- Create, extend, suspend licenses
- Activity tracking
- Responsive design

### 4. Integration Guide (`INTEGRATION_GUIDE.md`)
- Step-by-step setup instructions
- Code snippets for payment page
- Security best practices
- Troubleshooting guide

## 🚀 Quick Start

### Step 1: Setup Supabase Database

1. Go to your Supabase project
2. Open SQL Editor
3. Copy entire content of `supabase/schema.sql`
4. Execute all SQL

### Step 2: Deploy API to Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Create new project
3. Upload `api/licenses.js` to `/api` folder
4. Upload `package.json` and `vercel.json`
5. Set Environment Variables:
   ```
   SUPABASE_URL=https://gsivamaidhdjcrtzedmp.supabase.co
   SUPABASE_SERVICE_KEY=[get from Supabase Settings → API]
   ADMIN_API_KEY=your_secret_key_here_32_chars
   ```
6. Deploy

### Step 3: Host Admin Dashboard

1. Create account at [netlify.com](https://netlify.com)
2. Drag & drop `admin-dashboard.html`
3. Note your Netlify URL
4. Update `LICENSE_API` in dashboard code with your Vercel URL

### Step 4: Integrate with Payment Page

Update `xauusd-scalping-ai.html`:

```javascript
// Add this near top of script
const LICENSE_API = 'https://your-vercel-app.vercel.app/api/licenses';

// Replace verifyPayment() with new version from INTEGRATION_GUIDE.md
// Add helper functions: checkEmailExists(), createLicenseInDB(), logLicenseActivation()
```

See `INTEGRATION_GUIDE.md` for complete code snippets.

### Step 5: Update MT5 Expert Advisor

In your .ex5 source code (MQL5):

```mql5
#include <stdlib.mqh>

bool CheckLicenseHTTP(string email) {
   string url = "https://your-vercel-app.vercel.app/api/licenses?action=verify";
   string headers = "Content-Type: application/json\r\n";
   string body = "{\"email\":\"" + email + "\",\"version\":15}";
   
   string response = "";
   int res = URLDownloadToMemory(url, headers, body, 5000, response);
   
   return (res == 200 && StringFind(response, "\"valid\":true") >= 0);
}

int OnInit() {
   if (!CheckLicenseHTTP("user@example.com")) {
      Alert("License invalid or expired. Contact support.");
      return INIT_FAILED;
   }
   return INIT_SUCCEEDED;
}
```

## 📊 Admin Dashboard

Access at: `https://your-admin-dashboard.netlify.app`

**Login with:** Your ADMIN_API_KEY

### Tabs:
- **Overview** - Statistics and quick stats
- **Licenses** - View all licenses, search, filter
- **Manage** - Create, extend, suspend licenses
- **Activity** - Audit trail of all actions

## 🔌 API Endpoints

### Public Endpoint (No key required)
```
GET  /api/licenses?action=verify
     Body: { email, version }
     Returns: { valid, daysRemaining, email }
```

### Admin Endpoints (Require x-admin-key header)
```
GET  /api/licenses?action=list-all
GET  /api/licenses?action=stats
GET  /api/licenses?action=activity&limit=100&email=user@example.com

POST /api/licenses?action=create
     Body: { email, transaction_id, expiry_date, notes }

POST /api/licenses?action=update
     Body: { email, updates: {...} }

POST /api/licenses?action=extend
     Body: { email, days: 365 }

POST /api/licenses?action=suspend
     Body: { email, reason: "..." }

POST /api/licenses?action=delete
     Body: { email }
```

## 💾 Database Schema

### licenses
- `id` - UUID primary key
- `email` - User email (unique)
- `transaction_id` - Payment reference (unique)
- `status` - active|suspended|expired
- `expiry_date` - License expiry date
- `enabled` - Can disable without deleting
- `ai_version` - AI version (default: 15)
- `last_checked` - Last verification timestamp
- `downloads_count` - Track downloads

### ai_versions
- `version` - Version number (e.g., 15)
- `status` - active|deprecated|suspended
- `release_date` - When released
- `deprecation_date` - When deprecated

### license_activity_log
- `email` - User email
- `action` - verified|created|suspended|expired|downloaded
- `details` - JSON details
- `timestamp` - When action occurred

## 🔐 Security Features

✅ **Row Level Security (RLS)** on all tables
✅ **Admin API Key** validation on all protected endpoints
✅ **Activity Logging** for audit trail
✅ **Service Key** only used server-side
✅ **Environment Variables** for sensitive data
✅ **CORS headers** configured
✅ **Email uniqueness** enforced

## 📈 Usage Flow

### For You (Admin):
1. User purchases → License created automatically
2. User requests PIN → You send 9967
3. User verifies PIN → Downloads .ex5
4. Monitor activity → Admin dashboard
5. User's license expires? → Click "Extend" to renew
6. User violates ToS? → Click "Suspend" to block

### For User:
1. Purchase page → Enter email + transaction ID
2. Verify PIN → Get download link
3. Download .ex5 → Add to MT5 Experts folder
4. Run EA → License checked automatically
5. Trade! → AI runs as long as license valid
6. License expiring? → Contact you for renewal

## 🛠️ Troubleshooting

### "API Error: 401 Unauthorized"
- Check ADMIN_API_KEY in Vercel env vars
- Make sure it's not empty
- Regenerate if forgotten

### "License not found"
- Supabase tables not created
- Run `supabase/schema.sql` in SQL editor
- Check tables exist in Supabase dashboard

### "CORS Error in browser"
- API headers not set correctly
- Check CORS config in `api/licenses.js`
- Clear browser cache and try again

### "Email already has license"
- User trying to buy twice
- Direct to admin dashboard to renew instead
- Admin can delete old and recreate if needed

### "PIN not working"
- Check CORRECT_PIN constant (should be '9967')
- Make sure all 4 digits entered
- Clear browser localStorage

## 📞 Support

For issues:
1. Check logs in Vercel dashboard
2. Check Supabase database directly
3. Test API endpoints with Postman
4. Check admin dashboard activity log

## 📝 Cost Breakdown (FREE TIER)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | 1GB database, unlimited API calls | $0 |
| Vercel | 100GB bandwidth, serverless functions | $0 |
| Netlify | 1GB storage, continuous deployment | $0 |
| **TOTAL** | **Complete system** | **$0/month** |

## 🎯 Next Steps

1. ✅ Setup Supabase database
2. ✅ Deploy API to Vercel
3. ✅ Host dashboard on Netlify
4. ✅ Update payment page with integration code
5. ✅ Update MT5 EA with license check
6. ✅ Test end-to-end
7. ✅ Go live!

## 📚 Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Complete integration steps
- [supabase/schema.sql](./supabase/schema.sql) - Database schema
- [api/licenses.js](./api/licenses.js) - API implementation
- [admin-dashboard.html](./admin-dashboard.html) - Dashboard UI

---

**Built for LiquidGold AI by Allan Nambafu**

All code is open-source and free to use. Security is built-in. Scale with confidence.
