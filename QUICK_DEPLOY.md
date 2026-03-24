# Quick Deployment Guide

## 🚀 Fastest Way to Deploy

### Option 1: Railway (Recommended - 5 minutes) ⭐

**Why Railway?**
- ✅ All 3 services in one project
- ✅ Persistent storage (rate limiting works!)
- ✅ Free $5 credit/month
- ✅ Auto-deploy from GitHub
- ✅ Simple environment variables

**Steps:**

1. **Create Railway account:** https://railway.app

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add 3 services:**

   **Service 1: Frontend**
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l $PORT`
   - Add environment variable:
     - `VITE_API_BASE_URL` = `https://your-backend-url.railway.app/api`

   **Service 2: Backend**
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Add environment variables:
     - `NODE_ENV` = `production`
     - `PORT` = `3000`
     - `AI_SERVICE_URL` = `https://your-ai-service-url.railway.app`
     - `ALLOWED_ORIGINS` = `https://your-frontend-url.railway.app`
     - `JWT_SECRET` = (generate with: `openssl rand -base64 32`)
     - `SESSION_SECRET` = (generate with: `openssl rand -base64 32`)

   **Service 3: AI Service**
   - Root Directory: `ai_service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Add environment variables:
     - `FLASK_ENV` = `production`
     - `PORT` = `5000`
     - `ALLOWED_ORIGINS` = `https://your-frontend-url.railway.app`

4. **Deploy!** Railway will automatically deploy all services.

5. **Get URLs** from Railway dashboard and update environment variables.

6. **Redeploy** to apply environment variable changes.

**Done!** Your app is live! 🎉

---

### Option 2: Vercel (Frontend Only) + Railway (Backend)

**Best for:** Maximum frontend performance

1. **Deploy Frontend to Vercel:**
   ```bash
   cd client
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Deploy Backend + AI to Railway:**
   - Follow Railway steps above for services 2 & 3 only

3. **Update Frontend env in Vercel dashboard:**
   - `VITE_API_BASE_URL` = Railway backend URL

---

### Option 3: Render (Free Tier)

**Steps:**

1. **Create Render account:** https://render.com

2. **Create 3 Web Services:**

   **Frontend (Static Site):**
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

   **Backend (Web Service):**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node index.js`
   - Add environment variables (same as Railway)

   **AI Service (Web Service):**
   - Build Command: `cd ai_service && pip install -r requirements.txt`
   - Start Command: `cd ai_service && python app.py`
   - Add environment variables

**Note:** Free tier services sleep after 15 minutes of inactivity.

---

## 📋 Environment Variables Checklist

### Frontend
- [ ] `VITE_API_BASE_URL` - Backend API URL

### Backend
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `AI_SERVICE_URL` - AI service URL
- [ ] `ALLOWED_ORIGINS` - Frontend URL
- [ ] `JWT_SECRET` - Random 32-char string
- [ ] `SESSION_SECRET` - Random 32-char string

### AI Service
- [ ] `FLASK_ENV=production`
- [ ] `PORT=5000`
- [ ] `ALLOWED_ORIGINS` - Frontend URL

---

## 🔑 Generate Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SESSION_SECRET
openssl rand -base64 32
```

Or use online generator: https://generate-secret.vercel.app/32

---

## ⚠️ Important Notes

### For Vercel Deployment:

**Limitations:**
- Rate limiting state resets between requests (serverless)
- Need external Redis for persistent rate limiting
- Cold starts (1-3 seconds on first request)

**To fix rate limiting on Vercel:**
1. Sign up for Upstash Redis (free tier): https://upstash.com
2. Install: `npm install @upstash/redis`
3. Update `abuseProtection.js` to use Redis instead of in-memory storage

### For Railway/Render:
- ✅ Rate limiting works out of the box
- ✅ No cold starts
- ✅ Persistent storage

---

## 🧪 Test Your Deployment

After deployment:

1. **Test Frontend:**
   - Visit your frontend URL
   - Check if map loads
   - Try chat feature

2. **Test API:**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

3. **Test Security:**
   ```bash
   # Run security tests
   .\test-security.ps1 https://your-backend-url.railway.app
   ```

4. **Check Logs:**
   - Railway: View logs in dashboard
   - Vercel: `vercel logs`
   - Render: View logs in dashboard

---

## 💰 Cost Estimate

### Railway (Recommended)
- **Free Tier:** $5 credit/month
- **Usage:** ~$3-4/month for your app
- **Verdict:** ✅ Free for development

### Vercel
- **Frontend:** Free unlimited
- **Backend/AI:** Limited on free tier
- **Verdict:** ⚠️ Need paid plan for backend

### Render
- **Free Tier:** 750 hours/month per service
- **Limitation:** Services sleep after inactivity
- **Verdict:** ✅ Free but slower

---

## 🎯 My Recommendation

**For your Campus Navigation app:**

1. **Best:** Railway (all services) - $0-5/month
2. **Good:** Vercel (frontend) + Railway (backend) - $0-3/month
3. **Free:** Render (all services) - $0 but services sleep

**Start with Railway** - it's the easiest and works perfectly for your architecture!

---

## 🆘 Need Help?

If you encounter issues:

1. Check deployment logs
2. Verify environment variables
3. Test each service individually
4. Check CORS settings
5. Review security logs

Let me know which platform you choose and I can help with specific issues!
