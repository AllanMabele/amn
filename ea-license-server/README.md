# XAUUSD Scalping AI - License Management Server

**Institutional-grade EA license & user management system** built with **Next.js**, **Supabase**, and **Vercel**.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    EA (MetaTrader 5)                     │
│              Calls /api/license/validate                 │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
    ┌────▼────────┐         ┌────────▼─────┐
    │  Upstash    │         │   Next.js     │
    │   Redis     │◄────────┤   Backend     │
    │  (Cache)    │         │  (Vercel)     │
    └─────────────┘         └────┬──────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
              ┌─────▼──────┐            ┌───────▼────┐
              │  Supabase  │            │   Resend   │
              │ PostgreSQL │            │   Email    │
              │ (Database) │            │            │
              └────────────┘            └────────────┘

    ┌────────────────────────────────────┐
    │   Admin Dashboard (Next.js UI)     │
    │  - View all licenses               │
    │  - Disable/Enable/Extend/Revoke    │
    │  - View activity logs              │
    └────────────────────────────────────┘
```

## 🚀 Tech Stack (All Free Tier)

| Service | Purpose | Free Tier | Link |
|---------|---------|-----------|------|
| **Supabase** | PostgreSQL Database + Auth | 500 MB + Auth | [supabase.com](https://supabase.com) |
| **Vercel** | Next.js Hosting | 100 GB bandwidth/month | [vercel.com](https://vercel.com) |
| **Resend** | Transactional Email | 100 emails/day | [resend.com](https://resend.com) |
| **Upstash Redis** | Caching | 10,000 commands/day | [upstash.com](https://upstash.com) |

**Total Monthly Cost: $0** ✅

## 📦 Project Structure

```
ea-license-server/
├── app/
│   └── api/
│       ├── license/
│       │   └── validate/       # EA validation endpoint
│       ├── users/              # User & payment creation
│       ├── admin/
│       │   ├── auth/           # Admin login
│       │   └── licenses/       # License management
│       └── ...
├── lib/
│   ├── auth.ts                 # JWT & token generation
│   ├── db.ts                   # Prisma client
│   ├── redis.ts                # Upstash Redis client
│   ├── email.ts                # Resend email service
│   └── ...
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.local.example          # Environment template
├── package.json
└── README.md
```

## 🔧 Setup Instructions

### 1. **Create Supabase Project**

```bash
# Go to https://supabase.com and create a new project
# Get your credentials from Project Settings > API

export NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
export SUPABASE_DB_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
```

### 2. **Create Resend Account**

```bash
# Go to https://resend.com and sign up
# Get your API key from Dashboard

export RESEND_API_KEY="re_..."
```

### 3. **Create Upstash Redis**

```bash
# Go to https://upstash.com and create a Redis database
# Get your credentials from database details

export UPSTASH_REDIS_REST_URL="https://...upstash.io"
export UPSTASH_REDIS_REST_TOKEN="..."
```

### 4. **Clone & Install**

```bash
git clone https://github.com/AllanMabele/amn.git
cd ea-license-server

npm install
```

### 5. **Setup Database**

```bash
# Copy .env.local.example to .env.local and fill in credentials
cp .env.local.example .env.local

# Push Prisma schema to Supabase
npx prisma db push

# Optional: Open Prisma Studio to view database
npx prisma studio
```

### 6. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy

# Set environment variables in Vercel dashboard
# Then redeploy
vercel deploy --prod
```

## 📡 API Endpoints

### **For EA (MetaTrader 5)**

#### `POST /api/license/validate`
Validate if a license is active (called by EA on startup)

```bash
curl -X POST https://your-app.vercel.app/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "XAU-ABC123DEF456",
    "mtAccount": 1234567,
    "broker": "ICMarkets"
  }'
```

**Response:**
```json
{
  "valid": true,
  "message": "License active",
  "userId": "user_123",
  "expiresAt": "2027-06-02T00:00:00Z",
  "daysRemaining": 365,
  "userEmail": "user@example.com",
  "cached": false
}
```

---

### **For Users**

#### `POST /api/users`
Register user and create payment record

```bash
curl -X POST https://your-app.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "fullName": "John Doe",
    "transactionId": "TXN123456",
    "method": "USDT_TRC20",
    "walletAddress": "TBr4ZsJky3ufBaA6WMFVJ7hX36Wtf29NRz"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment received. Awaiting admin verification.",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "license": {
    "id": "lic_123",
    "pin": "9967"
  }
}
```

---

### **For Admin Dashboard**

#### `POST /api/admin/auth`
Admin login with PIN

```bash
curl -X POST https://your-app.vercel.app/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "9967"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "adminEmail": "allymabz@gmail.com"
}
```

---

#### `GET /api/admin/licenses?page=1&limit=50&status=active&search=user@example.com`
List all licenses (requires Bearer token)

```bash
curl -X GET "https://your-app.vercel.app/api/admin/licenses?page=1&limit=50&status=all" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "licenses": [
    {
      "id": "lic_123",
      "licenseKey": "XAU-ABC123DEF456",
      "user": {
        "id": "user_123",
        "email": "user@example.com",
        "fullName": "John Doe",
        "transactionMethod": "USDT_TRC20"
      },
      "isActive": true,
      "isRevoked": false,
      "expiresAt": "2027-06-02T00:00:00Z",
      "daysRemaining": 365,
      "expiryStatus": "active",
      "lastUsedAt": "2026-06-02T10:30:00Z",
      "mtAccountNumber": "1234567",
      "createdAt": "2026-06-02T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  }
}
```

---

#### `PATCH /api/admin/licenses/[id]`
Modify license (disable, enable, extend, revoke)

```bash
# Extend license by 90 days
curl -X PATCH "https://your-app.vercel.app/api/admin/licenses/lic_123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extend",
    "daysToAdd": 90,
    "reason": "Promo extension"
  }'
```

**Supported Actions:**
- `disable` - Deactivate license (user can't use EA)
- `enable` - Reactivate license
- `extend` - Add days to expiry date (requires `daysToAdd`)
- `revoke` - Permanently revoke license (reason required)

---

## 📊 Database Schema

### `User`
- `id` - UUID
- `email` - Unique
- `fullName` - Optional
- `transactionId` - Unique transaction reference
- `transactionMethod` - Payment method (USDT, MPESA, etc.)
- `walletAddress` - Crypto wallet (optional)
- `mpesaPhone` - M-Pesa phone (optional)
- `isActive` - Active status
- `createdAt` / `updatedAt`

### `License`
- `id` - UUID
- `userId` - Foreign key to User
- `licenseKey` - Unique license identifier
- `pin` - 4-digit PIN
- `expiresAt` - Expiry date
- `isActive` - Active status
- `isRevoked` - Revocation status
- `lastUsedAt` - Last validation time
- `mtAccountNumber` - Linked MT5 account
- `mtBroker` - Broker name

### `LicenseRenewal`
- Tracks all license extensions
- `previousExpiresAt` / `newExpiresAt`
- `daysAdded` / `renewalReason`

### `LicenseActivity`
- Audit log for all license events
- `action` - CREATE, ACTIVATE, DISABLE, VALIDATE, etc.
- `ipAddress` / `userAgent`

### `AdminLog`
- Admin actions audit trail
- `action`, `targetUserId`, `oldValue`, `newValue`, `reason`

---

## 🔐 Security Features

✅ **JWT Token Authentication** - Secure admin dashboard access
✅ **PIN-Protected Admin** - 4-digit PIN required for admin login
✅ **Redis Caching** - Reduces database load, faster validation
✅ **License Revocation** - Instantly disable licenses
✅ **Audit Logs** - All admin actions tracked
✅ **Activity Tracking** - IP address, user agent, timestamps
✅ **Email Verification** - Payment confirmations and expiry warnings

---

## 📋 Next Steps

1. **Create Admin Dashboard UI** (React component in `/app/admin`)
2. **Setup scheduled tasks** (cron jobs for expiry reminders)
3. **Add subscription renewals** (recurring billing)
4. **Create public user portal** (view license, download EA)
5. **Telegram bot integration** (notifications)

---

## 💬 Support

For questions or issues, contact: `allymabz@gmail.com`

---

**© 2026 LiquidGold AI · XAUUSD Scalping AI V15**
