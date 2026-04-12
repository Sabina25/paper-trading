# Paper Trading Platform 📈

> **A full-stack paper trading platform with real market data and virtual portfolio management**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 🚀 Overview

Paper Trading Platform is a full-stack application that lets users trade stocks with **real market prices** and virtual funds. Users register, receive a **$10,000 demo account**, and can buy/sell real stocks (AAPL, TSLA, NVDA and more) with live prices pulled from Finnhub API every minute.

---

## 🌐 Live Demo

**[🚀 Try Paper Trading → https://paper-trading-frontend-chi.vercel.app](https://paper-trading-frontend-chi.vercel.app)**

| Login | Dashboard | Portfolio |
|:---:|:---:|:---:|
| ![Login](./assets/login.png) | ![Dashboard](./assets/dashboard.png) | ![Portfolio](./assets/portfolio.png) |

---

## ✨ Key Features

### 📊 Real Market Data
- **Finnhub API** integration for real stock prices
- Prices updated every **60 seconds** from live market feed
- **Redis caching** for instant price access between updates
- **Server-Sent Events (SSE)** pushing updates to frontend every 5 seconds
- **● Live** indicator showing active connection status

### 💼 Trading Engine
- **Market orders** with instant execution at current real price
- **Transactional integrity** — all trades use PostgreSQL transactions
- **Balance & position validation** before every execution
- **Automatic account creation** with $10,000 virtual balance on registration

### 📈 Portfolio Tracking
- **Real-time unrealized P&L** calculated from live Finnhub prices
- **Position management** with weighted average price calculation
- **Full order history** with timestamps
- **Total equity** = cash balance + market value of all positions

### 🔒 Authentication
- **JWT-based authentication** with 7-day expiry
- **Bcrypt password hashing**
- **Protected routes** on both frontend and backend

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│   Frontend      │         │   Backend       │         │   Finnhub API    │
│   (Next.js)     │◄──SSE──►│   (Express.js)  │────────►│  (Real Prices)   │
│                 │         │                 │         │                  │
│ • TypeScript    │         │ • REST API      │         │ • Every 60s      │
│ • TanStack Query│         │ • SSE Stream    │         │ • 8 stocks       │
│ • Tailwind CSS  │         │ • JWT Auth      │         └──────────────────┘
└─────────────────┘         └────────┬────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                 ┌─────────────────┐   ┌─────────────────┐
                 │   PostgreSQL    │   │   Redis Cache   │
                 │                 │   │                 │
                 │ • Users         │   │ • Live prices   │
                 │ • Accounts      │   │ • Fast access   │
                 │ • Positions     │   │   between API   │
                 │ • Orders        │   │   calls         │
                 └─────────────────┘   └─────────────────┘
```

**Data flow:**
1. Backend fetches real prices from **Finnhub API** every 60 seconds
2. Prices stored in **Redis** for fast access and **PostgreSQL** for persistence
3. **SSE stream** pushes cached prices to all connected frontend clients every 5 seconds
4. Frontend receives updates and re-renders prices and P&L in real time

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15 · TypeScript · Tailwind CSS · TanStack Query · Axios · SSE

**Backend:** Node.js · Express.js · TypeScript · Prisma ORM · PostgreSQL · Redis · JWT

**Market Data:** Finnhub API (real-time stock prices)

**Infrastructure:** Vercel (frontend) · Railway (backend + database + cache) · Docker

---

## 🗄️ Data Model

```
User ──────────────► Account (balance: $10,000)
                         │
                         ├──► Position (assetId, quantity, avgPrice)
                         │
                         └──► Order (assetId, side, quantity, price, status)

Asset (symbol, name, price) ──► updated every 60s via Finnhub API
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Finnhub API key (free at [finnhub.io](https://finnhub.io))

### 1. Clone the repository
```bash
git clone https://github.com/Sabina25/paper-trading.git
cd paper-trading
```

### 2. Start the database and cache
```bash
docker-compose up -d
```

### 3. Set up the backend
```bash
cd apps/backend
cp .env.example .env    # fill in your values
npm install
npx prisma migrate dev
npm run dev
```

### 4. Set up the frontend
```bash
cd apps/frontend
npm install
npm run dev
```

### 5. Open the app
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 📁 Project Structure

```
paper-trading/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Database schema
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts        # Prisma client singleton
│   │   │   │   └── redis.ts         # Redis client singleton
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts          # JWT middleware
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts          # Register / Login
│   │   │   │   ├── assets.ts        # Stock prices + SSE stream
│   │   │   │   └── portfolio.ts     # Portfolio, orders, trading
│   │   │   ├── services/
│   │   │   │   └── marketData.ts    # Finnhub API integration
│   │   │   └── index.ts             # App entry point
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── login/           # Login / Register page
│       │   │   └── dashboard/       # Main trading dashboard
│       │   ├── components/
│       │   │   ├── dashboard/       # StatsCards, AssetTable, OrderPanel...
│       │   │   └── ProtectedRoute.tsx
│       │   ├── hooks/
│       │   │   ├── usePortfolio.ts  # Dashboard logic
│       │   │   └── usePriceStream.ts  # SSE hook
│       │   ├── lib/
│       │   │   ├── api.ts           # Axios API client
│       │   │   └── auth.tsx         # Auth context + provider
│       │   └── types/
│       │       └── index.ts         # Shared TypeScript types
│       └── package.json
├── docker-compose.yml
└── package.json
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account + auto-create $10k balance |
| POST | `/api/auth/login` | Login and receive JWT token |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | Get all assets with current prices |
| GET | `/api/assets/stream` | SSE stream of live price updates |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get portfolio, positions, and P&L |
| POST | `/api/portfolio/order` | Place a BUY or SELL market order |
| GET | `/api/portfolio/orders` | Get full order history |

---

## 🔧 Environment Variables

### Backend — `apps/backend/.env`
```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/paper_trading"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
FINNHUB_API_KEY="your-finnhub-api-key"
```

### Frontend — `apps/frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=https://paper-trading-production-817b.up.railway.app/api
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
