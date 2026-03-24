# 🎯 CampusGo - Demo Setup (5 Minutes)

## 📋 Pre-Demo Checklist

### 1️⃣ Find Your IP Address (1 minute)

**Windows:**
```bash
# Double-click: get-ip.bat
# OR run in Command Prompt:
ipconfig
```

**Look for:** `IPv4 Address: 192.168.1.XXX`

**Write it here:** `___________________`

---

### 2️⃣ Update API Configuration (1 minute)

**File:** `client/src/api.js`

**Change line 1:**
```javascript
// FROM:
const API_BASE = 'http://localhost:3000/api';

// TO (use YOUR IP):
const API_BASE = 'http://192.168.1.100:3000/api';
```

💡 **Tip:** You can copy from `client/src/api.network.example.js` and replace YOUR_IP_HERE

---

### 3️⃣ Start All Services (2 minutes)

Open **3 separate terminals:**

#### Terminal 1 - AI Service:
```bash
cd ai_service
python app.py
```
✅ Wait for: `Running on http://0.0.0.0:5000`

#### Terminal 2 - Backend:
```bash
cd server
npm start
```
✅ Wait for: `Server running on http://localhost:3000`

#### Terminal 3 - Frontend:
```bash
cd client
npm run dev
```
✅ Wait for: `Network: http://192.168.1.100:5173`

---

### 4️⃣ Test & Share (1 minute)

**Your Demo Link:**
```
http://[YOUR_IP]:5173
```

**Example:** `http://192.168.1.100:5173`

1. ✅ Open the link on your computer first
2. ✅ Test on your phone (same WiFi)
3. ✅ Share with others!

---

## 🎬 During Demo

### Keep These Running:
- ✅ All 3 terminal windows
- ✅ Your computer connected to WiFi
- ✅ Computer plugged into power

### Demo Features:
1. **Landing Page** - Show campus overview
2. **Explore Campus** - Interactive map
3. **Search Locations** - Find any building
4. **Get Directions** - Route between locations
5. **Chatbot** - Ask questions:
   - "Where is the library?"
   - "What are all the colleges?"
   - "Show me facilities"
   - "Hospital timings?"
   - "Parent visiting hours?"

---

## 🛑 After Demo

**Stop Services:**
- Press `Ctrl + C` in each terminal

**Revert API Config:**
```javascript
// Change back in client/src/api.js:
const API_BASE = 'http://localhost:3000/api';
```

---

## ⚠️ Troubleshooting

### Problem: "Can't access the link"
**Solutions:**
1. Check all 3 services are running
2. Verify same WiFi network
3. Check Windows Firewall settings
4. Try: `http://0.0.0.0:5173` instead

### Problem: "Chatbot not responding"
**Solution:** 
- Ensure AI service (port 5000) is running
- Check you updated api.js with correct IP

### Problem: "Map not loading"
**Solution:**
- Check internet connection (map tiles need internet)
- Verify backend (port 3000) is running

### Problem: "Connection refused"
**Solution:**
- Restart all 3 services
- Check firewall isn't blocking ports 3000, 5000, 5173

---

## 🔥 Quick Commands Reference

```bash
# Find IP
ipconfig                    # Windows
ifconfig                    # Mac/Linux

# Start Services
cd ai_service && python app.py          # Terminal 1
cd server && npm start                  # Terminal 2  
cd client && npm run dev                # Terminal 3

# Stop Service
Ctrl + C                    # In each terminal
```

---

## 📱 Mobile Demo Tips

1. Share QR code of the URL (use qr-code generator online)
2. Send link via WhatsApp/Email
3. Make sure mobile is on same WiFi
4. Test all features work on mobile too

---

## 🎓 Demo Script Suggestion

**Opening (30 seconds):**
"This is CampusGo - a smart navigation system for SRM Trichy campus."

**Landing Page (30 seconds):**
"Here you can see all campus facilities, events, and information."

**Map Demo (2 minutes):**
1. Click "Explore Campus"
2. Show all location markers
3. Search for two locations
4. Click "Get Route" - show navigation
5. Click "Clear" to reset

**Chatbot Demo (2 minutes):**
1. Open chatbot
2. Ask: "Where is the library?" - shows location highlight
3. Ask: "What are all the colleges?" - shows all colleges
4. Ask: "Show me facilities" - lists everything
5. Ask: "Hospital timings?" - shows specific info

**Closing (30 seconds):**
"The system works on any device, is fully mobile responsive, and helps students, visitors, and parents navigate the campus easily."

---

## ✨ Impressive Features to Highlight

- 🗺️ Interactive map with real campus locations
- 🤖 AI-powered chatbot with campus knowledge
- 📍 Location highlighting and zoom
- 🚶 Walking directions between locations
- 📱 Fully mobile responsive
- 💬 Natural language queries
- 🎯 Quick query buttons
- 🏫 Comprehensive campus information

---

## 📞 Need Help?

See detailed guide: `NETWORK_SHARING_GUIDE.md`

**Good luck with your demo! 🚀**
