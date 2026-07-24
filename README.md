# CampusGo — SRM Trichy Campus Navigation

A full-stack campus navigation web app for SRM Institute of Science and Technology, Trichy. Features interactive satellite map navigation, BFS graph-based route finding, an AI-powered campus chatbot, and JWT authentication.

## Features

- **Interactive Map** — Satellite tile map (Esri) via React-Leaflet with all campus locations marked
- **Route Finding** — BFS graph-based routing between campus locations with walking time and distance estimates
- **Campus Chatbot** — Pattern-matching AI assistant for campus info (timings, contacts, directions)
- **Auth** — JWT-based login/register with bcrypt password hashing
- **Responsive Design** — Desktop split-panel layout (sidebar + map) and mobile bottom-sheet layout
- **Bot Protection** — CAPTCHA middleware, rate limiting, and anti-scraping measures

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit (RTK Query) |
| Map | React-Leaflet, Leaflet.js, Esri satellite tiles |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Routing | Custom BFS graph (`campusRouter.js`) |
| Logging | Winston + daily-rotate-file |

## Project Structure

```
CampusGo/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── map/
│       │   │   ├── CampusMap.jsx     # Leaflet map, markers, route polyline
│       │   │   ├── SearchBar.jsx     # Location search + route UI
│       │   │   └── ChatBot.jsx       # Floating campus AI chatbot
│       │   ├── layout/               # Navbar, Footer
│       │   ├── sections/             # Landing page sections
│       │   └── ui/                   # Shared UI components
│       ├── pages/
│       │   ├── MapPage.jsx           # /map — main navigation page
│       │   ├── Home.jsx              # Landing page
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── redux/
│       │   ├── api/campusApi.js      # RTK Query API slice
│       │   └── slices/
│       │       ├── mapSlice.js       # Route + selected locations state
│       │       ├── chatSlice.js      # Chatbot messages + highlight state
│       │       └── authSlice.js      # Auth token + user state
│       └── index.css                 # Design tokens + Leaflet overrides
│
└── server/                   # Node.js + Express backend
    └── src/
        ├── routes/
        │   ├── campusRoutes.js       # /api/campus — locations + routing
        │   ├── chatRoutes.js         # /api/chat — chatbot endpoint
        │   ├── authRoutes.js         # /api/auth — login/register
        │   └── locationRoutes.js
        ├── services/
        │   ├── campusRouter.js       # BFS graph routing algorithm
        │   ├── chatKnowledge.js      # Pattern-matching chatbot knowledge base
        │   └── openRouteService.js
        ├── middleware/
        │   ├── authMiddleware.js     # JWT verification
        │   ├── rateLimiter.js        # Request rate limiting
        │   ├── captchaMiddleware.js  # Bot detection
        │   └── antiScraping.js
        ├── controllers/
        ├── model/
        └── db/
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas connection string)

### 1. Clone

```bash
git clone <repo-url>
cd CampusGo
```

### 2. Server setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusgo
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

### 3. Client setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run (two terminals)

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

App runs at `http://localhost:5173`

## Production Build

```bash
# Client (outputs to client/dist/)
cd client && npm run build

# Server
cd server && npm start
```

The client is deployable as a static site (Vercel, Netlify). The server can be deployed to Railway or any Node.js host.

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `PORT` | Server | Port to listen on (default 5000) |
| `MONGODB_URI` | Server | MongoDB connection string |
| `JWT_SECRET` | Server | Secret key for signing JWT tokens |
| `CLIENT_URL` | Server | Frontend origin for CORS |
| `VITE_API_URL` | Client | Backend API base URL |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/campus/locations` | All campus locations |
| `POST` | `/api/campus/route` | Find route between two locations |
| `POST` | `/api/chat` | Send message to campus chatbot |

## How Routing Works

The server stores campus locations as a graph where each node has a `connections` array of neighboring locations. When a route request arrives, `campusRouter.js` runs BFS from start to destination, returns the ordered path, walking time (avg 80m/min), and total distance.

## Security

- Helmet headers on all responses
- Rate limiting per IP (express-rate-limit)
- CAPTCHA middleware for bot detection
- Anti-scraping request fingerprinting
- JWT expiry + bcrypt password hashing
- CORS restricted to configured client origin




Project Built by Pujari Saisree & Lathif Ahmad
