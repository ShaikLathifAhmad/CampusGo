# Smart Campus Navigation System

A comprehensive campus navigation system with AI-powered routing, featuring a React client, Node.js server, and Python AI service.

## 🏗️ Project Structure

```
.
├── client/           # Frontend application (Vite + Leaflet)
├── server/           # Backend API (Node.js + Express)
├── ai_service/       # AI routing service (Python + Flask)
└── docs/            # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-campus-navigation
   ```

2. **Set up the Client**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the Server**
   ```bash
   cd ../server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the AI Service**
   ```bash
   cd ../ai_service
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

Run all services in separate terminals:

**Terminal 1 - AI Service:**
```bash
cd ai_service
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python app.py
```

**Terminal 2 - Server:**
```bash
cd server
npm run dev
```

**Terminal 3 - Client:**
```bash
cd client
npm run dev
```

Access the application at `http://localhost:5173`

## 📦 Production Build

### Client
```bash
cd client
npm run build
# Output will be in client/dist/
```

### Server
```bash
cd server
npm start
```

### AI Service
```bash
cd ai_service
python wsgi.py
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms.

## 🔧 Configuration

Each service requires environment variables. Copy `.env.example` to `.env` in each directory and configure:

- **Client**: API endpoints, feature flags
- **Server**: Port, AI service URL, security keys, CORS settings
- **AI Service**: Port, Flask settings, logging configuration

## 📚 API Documentation

- Server API runs on port 3000 (configurable)
- AI Service API runs on port 5000 (configurable)
- See `/docs/API.md` for endpoint details

## 🔒 Security Features

- Rate limiting and abuse protection
- CORS configuration
- Helmet security headers
- Request logging and monitoring
- Anti-scraping measures

## 🧪 Testing

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test

# AI Service tests
cd ai_service
python -m pytest
```

## 📄 License

[Your License Here]

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.
