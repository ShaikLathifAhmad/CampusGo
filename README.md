# 🗺️ CampusGO - Smart Campus Navigation System

A comprehensive campus navigation system for SRM Institute of Science and Technology, Trichy, featuring interactive maps, AI-powered chatbot, and real-time route planning.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Mobile Access](#mobile-access)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)

---

## ✨ Features

- 🗺️ **Interactive Campus Map** - Satellite and street view with custom markers
- 🤖 **AI-Powered Chatbot** - Natural language queries about campus facilities
- 🚶 **Route Planning** - Walking directions between any two locations
- 📍 **Location Highlighting** - Visual feedback for searched locations
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🎯 **Quick Queries** - Pre-defined questions for common information
- 🏫 **Comprehensive Data** - All campus buildings, hostels, amenities, and facilities
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **Leaflet.js** - Interactive maps
- **Zustand** - State management
- **Vanilla JavaScript** - No framework overhead

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

### AI Service
- **Python Flask** - AI service backend
- **OpenAI API** - Natural language processing

### APIs
- **OpenRouteService** - Route calculation
- **OpenStreetMap** - Map tiles

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **pip** (comes with Python)
- **Git** (optional) - [Download](https://git-scm.com/)

### Check Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Python version
python --version

# Check pip version
pip --version
```

---

## 🚀 Installation

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd project-folder

# Or download and extract the ZIP file
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

**Dependencies installed:**
- leaflet
- leaflet-routing-machine
- zustand
- vite

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

**Dependencies installed:**
- express
- cors
- axios
- dotenv

### 4. Install AI Service Dependencies

```bash
cd ../ai_service
pip install -r requirements.txt
```

**Dependencies installed:**
- Flask
- Flask-CORS
- openai
- python-dotenv

---

## ▶️ Running the Project

You need to run **3 services** simultaneously. Open **3 separate terminal windows**:

### Terminal 1: AI Service (Port 5000)

```bash
cd ai_service
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

### Terminal 2: Backend Server (Port 3000)

```bash
cd server
npm start
```

**Expected output:**
```
Server running on http://localhost:3000
Network access: http://[YOUR_IP]:3000
```

### Terminal 3: Frontend Dev Server (Port 5173)

```bash
cd client
npm run dev
```

**Expected output:**
```
VITE v5.4.21  ready in 254 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

---

## 🌐 Accessing the Application

### Local Access (Same Computer)

Open your browser and navigate to:
```
http://localhost:5173
```

### Network Access (Other Devices on Same WiFi)

1. Find your computer's IP address:

**Windows:**
```bash
ipconfig
```
Look for: `IPv4 Address: 192.168.x.x`

**Mac/Linux:**
```bash
ifconfig
```

2. Access from any device on the same network:
```
http://192.168.x.x:5173
```

---

## 📁 Project Structure

```
project-root/
├── client/                    # Frontend application
│   ├── public/               # Static assets (images, icons)
│   ├── src/                  # Source code
│   │   ├── main.js          # Main application logic
│   │   ├── mapService.js    # Map functionality
│   │   ├── api.js           # API configuration
│   │   ├── store.js         # State management
│   │   └── style.css        # Styles
│   ├── index.html           # Map page
│   ├── landing.html         # Landing page
│   └── package.json         # Dependencies
│
├── server/                   # Backend server
│   ├── index.js             # Express server
│   └── package.json         # Dependencies
│
├── ai_service/              # AI chatbot service
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
│
└── README.md               # This file
```

---

## ⚙️ Configuration

### API Keys

The project uses the following APIs:

1. **OpenRouteService API** (for routing)
   - Already configured in `mapService.js`
   - Free tier: 40 requests/minute

2. **OpenAI API** (for chatbot)
   - Configure in `ai_service/.env`
   - Create `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Network Configuration (Optional)

For network sharing, update `client/src/api.js`:

```javascript
// Change from:
const API_BASE = 'http://localhost:3000/api';

// To (use your IP):
const API_BASE = 'http://192.168.x.x:3000/api';
```

---

## 📱 Mobile Access

### Setup for Mobile Demo

1. **Find your IP address:**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Update API configuration:**
   - Edit `client/src/api.js`
   - Replace `localhost` with your IP address

3. **Ensure all services are running**

4. **Connect mobile device to same WiFi**

5. **Open browser on mobile:**
   ```
   http://192.168.x.x:5173
   ```

### Mobile Features

- ✅ Touch-optimized interface
- ✅ Responsive design
- ✅ No auto-zoom on inputs (16px font size)
- ✅ Large touch targets (45px minimum)
- ✅ Smooth animations
- ✅ Full functionality

---

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** Port 3000, 5000, or 5173 is already in use

**Solution:**
```bash
# Windows - Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Cannot Access from Mobile

**Problem:** Mobile device can't connect

**Solutions:**
1. Ensure both devices are on the same WiFi network
2. Check Windows Firewall settings
3. Verify `api.js` has correct IP address
4. Try disabling firewall temporarily

### Map Not Loading

**Problem:** Map tiles not appearing

**Solutions:**
1. Check internet connection (map tiles require internet)
2. Verify backend server is running
3. Check browser console for errors
4. Try refreshing the page

### Chatbot Not Responding

**Problem:** AI chatbot doesn't respond

**Solutions:**
1. Ensure AI service (port 5000) is running
2. Check OpenAI API key in `.env` file
3. Verify `api.js` configuration
4. Check browser console for errors

### Route Not Displaying

**Problem:** Route between locations doesn't show

**Solutions:**
1. Check OpenRouteService API is accessible
2. Verify location names are correct
3. Check browser console for errors
4. Try different locations

---

## 📚 API Documentation

### Backend Endpoints

#### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

Request:
{
  "message": "Where is the library?"
}

Response:
{
  "response": "The library is located...",
  "highlightLocation": "Medical college library",
  "highlightMultipleLocations": ["location1", "location2"]
}
```

### Frontend API Usage

```javascript
import { api } from './api';

// Send chat message
const response = await api.sendMessage("Where is the hospital?");
console.log(response.response);

// Highlight location if provided
if (response.highlightLocation) {
  mapService.highlightLocation(response.highlightLocation);
}
```

---

## 🎯 Usage Guide

### Landing Page Features

1. **Campus Overview** - View all facilities and events
2. **Explore Campus Button** - Navigate to interactive map
3. **Events Section** - See ongoing and upcoming events
4. **Contact Information** - Get campus contact details

### Map Page Features

1. **Search Locations**
   - Enter start and destination
   - Click "Get Route" for directions
   - View walking time and distance

2. **Chatbot**
   - Click chat button (💬) to open
   - Ask questions naturally
   - Use quick query buttons
   - Locations are highlighted automatically

3. **Map Controls**
   - Zoom in/out
   - Switch between satellite and street view
   - Click markers for information
   - Pan around the campus

### Sample Chatbot Queries

- "Where is the library?"
- "Show me all hostels"
- "What are the facilities?"
- "Hospital timings?"
- "How do I get to the auditorium?"
- "Tell me about the engineering block"

---

## 🔒 Security & Production Deployment

### Security Features Implemented

✅ **HTTPS Enforcement** - Automatic HTTP to HTTPS redirect in production  
✅ **Secrets Management** - Environment variables for all sensitive data  
✅ **Comprehensive Logging** - Authentication attempts, API errors, suspicious activity  
✅ **Advanced Rate Limiting** - Multi-tier rate limiting for all endpoints  
✅ **Login Protection** - 5 attempts per 15 minutes, 30-minute lockout  
✅ **Account Creation Limits** - 3 per hour, 10 per day per IP  
✅ **AI Request Limits** - 10 per minute, 100 per hour  
✅ **Bot Detection** - User agent analysis, header validation, behavior patterns  
✅ **Anti-Scraping** - Data access pattern detection, request fingerprinting  
✅ **CAPTCHA Support** - Challenge-response for suspicious IPs  
✅ **Honeypot Fields** - Hidden form fields to catch bots  
✅ **Submission Timing** - Detects forms submitted too quickly  
✅ **IP Blocking** - Automatic blocking after suspicious activity  
✅ **Input Validation** - XSS prevention, SQL injection protection  
✅ **Security Headers** - Helmet.js with CSP, HSTS, X-Frame-Options  
✅ **CORS Whitelist** - Origin-based access control  

### Abuse Protection Features

**Rate Limiting Tiers:**
- General API: 100 requests/minute per IP
- Login attempts: 5 attempts per 15 minutes
- Account creation: 3 per hour, 10 per day
- AI generation: 10 per minute, 100 per hour
- Data access: 20 requests per minute

**Bot Detection:**
- User agent validation
- Missing browser headers detection
- Request pattern analysis
- Automated script identification
- High-confidence bots blocked immediately

**Anti-Scraping:**
- Sequential access pattern detection
- Request rate monitoring
- Response fingerprinting
- Automatic suspicious IP flagging

**Automatic Protection:**
- IPs marked suspicious after 3 violations
- Automatic blocking after repeated abuse
- 30-minute lockout for failed logins
- CAPTCHA required for suspicious IPs  

### Quick Security Setup

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp ai_service/.env.example ai_service/.env
   ```

2. **Generate strong secrets:**
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For SESSION_SECRET
   ```

3. **Obtain SSL certificate:**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

4. **Configure firewall:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw deny 3000/tcp
   sudo ufw deny 5000/tcp
   sudo ufw enable
   ```

### Security Documentation

- 📘 **[Security Deployment Guide](SECURITY_DEPLOYMENT.md)** - Complete deployment instructions
- 📋 **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- 📊 **[Security Summary](SECURITY_SUMMARY.md)** - All security features explained
- ⚡ **[Quick Reference](SECURITY_QUICK_REFERENCE.md)** - Common commands and troubleshooting

### Monitoring & Logs

All security events are logged:
- Authentication attempts
- API errors with stack traces
- Rate limit violations
- Suspicious activity (injection attempts, unauthorized access)
- CORS violations

**Log locations:**
```
server/logs/app.log          # All server logs
server/logs/security.log     # Security events
server/logs/error.log        # Errors only
ai_service/logs/app.log      # AI service logs
ai_service/logs/security.log # AI security events
```

**Monitor logs:**
```bash
# View security events
grep "SECURITY" server/logs/security.log | tail -20

# Check for errors
tail -f server/logs/error.log

# Monitor suspicious activity
grep "suspicious\|401\|403\|429" server/logs/app.log
```

### Production Deployment

**Option 1: PM2 (Recommended)**
```bash
npm install -g pm2
pm2 start server/index.js --name campus-nav-server
pm2 start ai_service/app.py --name campus-nav-ai --interpreter python3
pm2 save
pm2 startup
```

**Option 2: Docker**
```bash
docker-compose up -d
```

**Option 3: Nginx Reverse Proxy**
See `nginx.conf.example` for complete configuration.

### Security Best Practices

- Never commit `.env` files (they're in `.gitignore`)
- Use strong secrets (minimum 32 characters)
- Keep dependencies updated (`npm audit`, `pip check`)
- Monitor logs daily for suspicious activity
- Review blocked IPs weekly
- Rotate secrets every 90 days
- Test backups monthly
- Use HTTPS only in production
- Implement authentication before public deployment
- Monitor rate limit violations
- Review bot detection logs
- Adjust rate limits based on traffic patterns

### Abuse Protection Monitoring

**Check blocked IPs:**
```bash
# View security events
grep "blocked\|suspicious" server/logs/security.log | tail -50

# Check abuse protection stats
curl http://localhost:3000/api/auth/admin/abuse-stats
```

**Unblock an IP (if needed):**
```bash
curl -X POST http://localhost:3000/api/auth/admin/unblock-ip \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100"}'
```

---

## 🔒 Security Notes

### Implemented Security Features

✅ **Rate Limiting** - 100 requests per minute per IP
✅ **Advanced Rate Limiting** - Multi-tier limits for different endpoints
✅ **Login Protection** - 5 attempts per 15 minutes with lockout
✅ **Account Creation Limits** - 3 per hour, 10 per day per IP
✅ **AI Request Limits** - 10 per minute, 100 per hour
✅ **Bot Detection** - User agent, headers, behavior analysis
✅ **Anti-Scraping** - Pattern detection, request fingerprinting
✅ **CAPTCHA Support** - Challenge-response for suspicious IPs
✅ **Honeypot Fields** - Hidden fields to catch bots
✅ **Submission Timing** - Detects too-fast form submissions
✅ **IP Blocking** - Automatic blocking after abuse
✅ **Input Validation** - All inputs sanitized and validated
✅ **XSS Prevention** - HTML tags stripped from user input
✅ **IDOR Protection** - Ownership checks on data access (ready for auth)
✅ **Coordinate Validation** - Ensures locations are within campus bounds
✅ **Duplicate Prevention** - Prevents duplicate location entries
✅ **Error Handling** - Secure error messages without sensitive data
✅ **Request Timeouts** - 10-second timeout on external API calls
✅ **Length Limits** - Maximum lengths enforced on all text inputs

### API Security

- **Chat messages**: Max 500 characters, 10 requests/min, 100/hour
- **Route requests**: AI rate limited, 10 requests/min
- **Location names**: Max 100 characters  
- **Descriptions**: Max 500 characters
- **Coordinates**: Validated within campus area (10.94-10.97 lat, 78.74-78.77 lng)
- **Login attempts**: 5 per 15 minutes, then 30-minute lockout
- **Account creation**: 3 per hour, 10 per day per IP
- **Data access**: 20 requests per minute to prevent scraping

### Best Practices

- Never commit API keys to version control
- Use environment variables for sensitive data
- Keep `.env` files in `.gitignore`
- Update API keys regularly
- Use HTTPS in production
- Implement authentication before deploying to production
- Use a real database (PostgreSQL/MongoDB) instead of in-memory storage

### Future Authentication Recommendations

When adding user authentication:
1. Use **bcrypt** for password hashing (12+ rounds)
2. Implement **JWT** with short expiration (15 min access, 7 day refresh)
3. Add **express-rate-limit** package for advanced rate limiting
4. Use **helmet.js** for security headers
5. Implement **express-validator** for input sanitization
6. Add **nodemailer** for email verification
7. Use **Redis** for session management
8. Enable **2FA** using speakeasy/otplib
9. Implement **CSRF protection**
10. Add **SQL injection** prevention (use parameterized queries)

---

## 🚀 Deployment

### Quick Deployment Options

**Option 1: Railway (Recommended)** ⭐
- All 3 services in one project
- Persistent storage (rate limiting works!)
- Free $5 credit/month
- [See QUICK_DEPLOY.md](QUICK_DEPLOY.md)

**Option 2: Vercel (Frontend) + Railway (Backend)**
- Best frontend performance
- Reliable backend hosting
- [See VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

**Option 3: Render**
- Free tier available
- Services sleep after inactivity
- [See QUICK_DEPLOY.md](QUICK_DEPLOY.md)

### Deployment Files Created

- ✅ `vercel.json` - Vercel configuration (root)
- ✅ `client/vercel.json` - Frontend Vercel config
- ✅ `server/vercel.json` - Backend Vercel config
- ✅ `ai_service/vercel.json` - AI service Vercel config
- ✅ `railway.toml` - Railway configuration
- ✅ `VERCEL_DEPLOYMENT.md` - Detailed Vercel guide
- ✅ `QUICK_DEPLOY.md` - Quick deployment guide

### Important: Multi-Service Architecture

Your app has 3 services that need to communicate:
1. Frontend (Vite) - Port 5173
2. Backend (Node.js) - Port 3000
3. AI Service (Python) - Port 5000

**For Vercel:** Deploy each service separately and connect via environment variables.

**For Railway/Render:** Deploy all services in one project for easier management.

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions!

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Deploy `dist` folder to Vercel/Netlify

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy

### AI Service (Render/Railway)

1. Create `Procfile`:
   ```
   web: python app.py
   ```

2. Deploy to Render/Railway
3. Set OpenAI API key in environment variables

---

## 📝 Development Tips

### Hot Reload

All services support hot reload:
- Frontend: Vite auto-reloads on file changes
- Backend: Use `nodemon` for auto-restart
- AI Service: Flask debug mode auto-reloads

### Debugging

Enable debug mode:

**Frontend:**
```javascript
// Check browser console (F12)
console.log('Debug info:', data);
```

**Backend:**
```javascript
// Add logging
console.log('Request received:', req.body);
```

**AI Service:**
```python
# Flask debug mode
app.run(debug=True)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is for educational purposes.

---

## 👥 Team

Developed by students of SRM Institute of Science and Technology, Trichy.

---

## 📞 Support

For issues or questions:
- Check the Troubleshooting section
- Review the documentation files
- Contact the development team

---

## 🎉 Acknowledgments

- OpenStreetMap for map tiles
- OpenRouteService for routing
- Leaflet.js for map functionality
- OpenAI for AI capabilities
- SRM Trichy for campus data

---

**Happy Navigating! 🗺️✨**
