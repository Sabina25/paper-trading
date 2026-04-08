# Paper Trading Platform 📈

> **A full-stack paper trading platform with real-time price simulation and virtual portfolio management**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 🚀 Overview

Paper Trading Platform is a full-stack application that simulates a real-world trading system with virtual funds. Users can register, receive a $10,000 demo account, browse live-updating stock prices, execute buy/sell orders, and track their portfolio performance in real time.

---

## ✨ Key Features

### 📊 Real-Time Market Data
- **Server-Sent Events (SSE)** for live price streaming
- **Simulated price engine** updating 8 stocks every 3 seconds
- **Redis caching** for fast price access
- **● Live** indicator showing active SSE connection

### 💼 Trading Engine
- **Market orders** with instant execution
- **Transactional integrity** — all trades use DB transactions
- **Balance & position validation** before execution
- **Automatic account creation** with $10,000 virtual balance

### 📈 Portfolio Tracking
- **Real-time P&L** (unrealized profit/loss)
- **Position management** with average price calculation
- **Full order history**
- **Total equity** = cash + market value of positions

### 🔒 Authentication
- **JWT-based authentication**
- **Bcrypt password hashing**
- **Protected routes** on both frontend and backend

---

## 🏗️ Architecture