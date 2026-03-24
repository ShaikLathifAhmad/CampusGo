# Vercel Deployment Guide

## Important: Multi-Service Architecture Considerations

Your Campus Navigation app has **3 separate services**:
1. Frontend (Vite/React)
2. Backend API (Node.js/Express)
3. AI Service (Python/Flask)

### ⚠️ Vercel Limitations

Vercel is primarily designed for **frontend applications** and **serverless functions**. For your multi-service architecture, you have two deployment options:

---

## Option 1: Split Deployment (Recommended)

Deploy each service separately and connect them:

### 1. Deploy Frontend to Vercel

```bash
cd client
vercel
```

**Configuration:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2. Deploy Backend to Vercel (as Serverless Functions)

```bash
cd server
vercel
```

**Note:** Your Express app will be converted to serverless functions. Some features may need adjustment:
- In-memory storage (rate limiting, abuse protection) will reset between requests
- Use external services (Redis, Upstash) for persistent storage

### 3. Deploy AI Service to Vercel (as Python Serverless)

```bash
cd ai_service
vercel
```

**Note:** Python serverless functions have limitations:
- Cold start times
- Execution time limits (10 seconds on free tier)
- Memory limits

### 4. Update Environment Variables

After deployment, update your frontend `.env`:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_AI_SERVICE_URL=https://your-ai-service.vercel.app
```

---

## Option 2: Alternative Hosting (Better for Your Architecture)

For a multi-service app with real-time features and persistent state, consider:

### A. Railway.app (Recommended) ⭐

**Pros:**
- Supports multiple services in one project
- Persistent storage
- WebSocket support
- Easy environment variables
- Free tier available

**Deployment:**
1. Create account at railway.app
2. Connect GitHub repository
3. Railway auto-detects services
4. Add environment variables
5. Deploy!

**Cost:** Free tier: $5 credit/month, then $0.000231/GB-second

### B. Render.com

**Pros:**
- Free tier for web services
- Supports Node.js and Python
- Persistent disks
- Auto-deploy from Git

**Deployment:**
1. Create account at render.com
2. Create 3 web services:
   - Frontend (Static Site)
   - Backend (Web Service - Node.js)
   - AI Service (Web Service - Python)
3. Configure environment variables
4. Deploy!

**Cost:** Free tier available (services sleep after inactivity)

### C. Fly.io

**Pros:**
- Docker-based deployment
- Multiple regions
- Persistent volumes
- WebSocket support

**Deployment:**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy each service
cd server && fly launch
cd ../ai_service && fly launch
cd ../client && fly launch
```

**Cost:** Free tier: 3 VMs, 3GB storage

### D. DigitalOcean App Platform

**Pros:**
- Simple deployment
- Managed services
- Auto-scaling
- Built-in monitoring

**Cost:** Starts at $5/month per service

---

## Option 3: Vercel Frontend + External Backend

**Best compromise for Vercel:**

1. **Deploy Frontend to Vercel** (Free)
   ```bash
   cd client
   vercel
   ```

2. **Deploy Backend + AI to Railway/Render** (Free tier)
   - Both services in one deployment
   - Persistent storage for rate limiting
   - Better performance

3. **Update Frontend Environment Variables** in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

---

## Vercel Deployment Steps (If You Choose Vercel)

### Prerequisites

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### Deploy Frontend

```bash
cd client
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `campus-nav-frontend`
- Directory? `./`
- Override settings? **N**

### Deploy Backend

```bash
cd ../server
vercel
```

**Important:** Add environment variables in Vercel dashboard:
- `NODE_ENV=production`
- `AI_SERVICE_URL=https://your-ai-service.vercel.app`
- `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
- `JWT_SECRET=your-secret`
- `SESSION_SECRET=your-secret`

### Deploy AI Service

```bash
cd ../ai_service
vercel
```

Add environment variables:
- `FLASK_ENV=production`
- `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Connect Services

1. Get deployment URLs from Vercel dashboard
2. Update environment variables:
   - Frontend: `VITE_API_BASE_URL`
   - Backend: `AI_SERVICE_URL`
   - Backend: `ALLOWED_ORIGINS`
   - AI Service: `ALLOWED_ORIGINS`

3. Redeploy all services:
   ```bash
   vercel --prod
   ```

---

## Important Considerations for Vercel

### 1. Serverless Limitations

**Rate Limiting & Abuse Protection:**
- In-memory storage resets between requests
- Need external storage (Redis/Upstash)

**Solution:**
```bash
# Install Upstash Redis
npm install @upstash/redis

# Update abuseProtection.js to use Redis
```

### 2. Cold Starts

- First request may be slow (1-3 seconds)
- Subsequent requests are fast
- Consider keeping services warm with cron jobs

### 3. Execution Time Limits

- Free tier: 10 seconds
- Pro tier: 60 seconds
- Hobby tier: 10 seconds

### 4. File System

- Read-only file system
- Can't write logs to disk
- Use external logging service (Logtail, Papertrail)

---

## Recommended Deployment Strategy

### For Development/Testing:
✅ **Vercel** (Frontend only) + **Railway** (Backend + AI)

### For Production:
✅ **Railway** (All services) - Best for your architecture
✅ **Render** (All services) - Good free tier
✅ **DigitalOcean** (All services) - Reliable, scalable

### Why Not Vercel for Everything?
- ❌ In-memory state doesn't persist (rate limiting breaks)
- ❌ Cold starts affect user experience
- ❌ Serverless not ideal for stateful applications
- ❌ More complex to manage 3 separate deployments

---

## Quick Start: Railway Deployment (Recommended)

1. **Create Railway account:** https://railway.app

2. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

3. **Login:**
   ```bash
   railway login
   ```

4. **Initialize project:**
   ```bash
   railway init
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Add environment variables** in Railway dashboard

7. **Done!** Railway provides URLs for all services

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Vercel | Frontend unlimited | $20/month | Static sites, serverless |
| Railway | $5 credit/month | Pay as you go | Multi-service apps |
| Render | 750 hours/month | $7/service | Full-stack apps |
| Fly.io | 3 VMs free | Pay as you go | Docker apps |
| DigitalOcean | $200 credit (60 days) | $5/month/service | Production apps |

---

## My Recommendation

**For your Campus Navigation app:**

🏆 **Best Choice: Railway**
- Deploy all 3 services together
- Persistent storage works out of the box
- Simple environment variable management
- Auto-deploy from GitHub
- Free tier sufficient for testing

**Second Choice: Render**
- Good free tier
- Easy to use
- Services sleep after inactivity (can be woken up)

**Third Choice: Vercel (Frontend) + Railway (Backend)**
- Best of both worlds
- Vercel's excellent frontend hosting
- Railway's backend capabilities

---

## Need Help?

Choose your deployment platform and I can provide detailed step-by-step instructions!

1. Railway (Recommended)
2. Render
3. Vercel (with limitations)
4. Fly.io
5. DigitalOcean

Let me know which one you'd like to use!
