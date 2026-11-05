# 🌾 FarmConnect — Direct Farmer-to-Customer Marketplace

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.x-38b2ac.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-47A248.svg)](https://mongoosejs.com/)
[![Redis](https://img.shields.io/badge/redis-ioredis-DC382D.svg)](https://redis.io/)

**FarmConnect** is a commercial-grade, direct-to-consumer digital marketplace connecting consumers directly to verified Indian farmers. By eliminating unnecessary layers of intermediaries and speculative mandi brokers, FarmConnect ensures higher profit margins for farming households while delivering farm-fresh, traceable produce straight to consumers' doorsteps.

---

## 🚀 Key Value Propositions

1. **Farmer Channels**: Every verified agricultural producer receives their own branded channel (`FC-CH-0000XXXX`), featuring banner art, bio, certifications (FSSAI, India Organic), harvest stories, and direct subscription channels.
2. **Deterministic 13-State Order Workflow**: Orders adhere to an airtight state machine (`PLACED` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `HARVESTED` ➔ `PACKED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`), strictly guarded against out-of-order jumps.
3. **Double-Entry Wallet & Escrow Ledger**: In-platform digital purse ensuring instantaneous checkouts with atomic double-entry balance verification.
4. **AI-Powered Product Assist**: Integrated Gemini AI pipeline providing farmers with automated botanical descriptions, pricing corridors, and preservation tips (with zero-crash heuristic fallbacks).
5. **Cold-Chain & Delivery Partner Module**: Driver dispatch system with atomic order claims preventing multiple drivers from taking the same package.
6. **Super Admin Governance**: Document review interface for KYF (Know Your Farmer), 7-day A/B testable Hero Carousel CMS, and append-only tamper-evident audit logs.

---

## 🏗️ Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Client Application      │
                          │ React 18 + Vite + Tailwind│
                          └─────────────┬─────────────┘
                                        │ HTTP / REST & WebSockets
                                        ▼
                          ┌───────────────────────────┐
                          │      Express Gateway      │
                          │   Helmet, CORS, JWT Auth  │
                          └──────┬──────┬──────┬──────┘
                                 │      │      │
       ┌─────────────────────────┘      │      └─────────────────────────┐
       ▼                                ▼                                ▼
┌──────────────┐              ┌──────────────────┐             ┌──────────────────┐
│ MongoDB      │              │ Redis Cache &    │             │ Google Gemini AI │
│ Mongoose ODM │              │ Order Queue      │             │ Botanical Assist │
└──────────────┘              └──────────────────┘             └──────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- *(Optional)* Local **MongoDB** and **Redis** servers (FarmConnect includes built-in graceful fallbacks for local frontend/backend development without requiring active daemon instances).

### 1. Installation

Install all client and server dependencies:
```bash
# From the repository root
npm run install:all
```
*(Or navigate to `server/` and `client/` directories and run `npm install` individually).*

### 2. Environment Configuration

Copy `.env.example` into `server/.env`:
```bash
cp .env.example server/.env
```
Key defaults are pre-configured for local developer environments.



## 👥 Demo Personas & Instant Login

FarmConnect provides pre-seeded accounts for all four user roles. On the Login page (`/login`), click any **Quick-Fill Role** button or use the following credentials:

| Role | Login ID | Email | Password | Primary Feature Showcase |
|---|---|---|---|---|
| **Customer** | `RV10241` | `ramesh.verma@example.com` | `Pass123!` | Discovery, cart, expected delivery formula, wallet checkout, tracking |
| **Farmer** | `SP20491` | `suresh.patel@example.com` | `Pass123!` | Channel management, AI item creation, order state transitions |
| **Delivery** | `RK30182` | `ravi.kumar@example.com` | `Pass123!` | Atomic order claim, route dispatch, OTP-verified dropoff |
| **Admin** | `FC99001` | `admin@farmconnect.internal` | `Pass123!` | KYF verification review, CMS hero slides, system audit logs |

> **OTP Note**: In non-production modes, the universal development OTP bypass code is `123456`.

---

## 🧪 Running Automated Backend Tests

FarmConnect includes verification test suites for state machine transitions, AES-256-GCM encryption/decryption, password hashing, and JWT issuance:

```bash
npm run test:server
```

**Output:**
```
✓ PASS: All 9 sequential state machine transitions succeeded.
✓ PASS: Illegal state machine jump (DELIVERED -> PROCESSING) strictly caught.
✓ PASS: AES-256-GCM encryption, decryption, and PII masking verified.
✓ PASS: Password hashing and verification verified.
✓ PASS: JWT access token issuance and signature verification succeeded.
```

---

## 📂 Project Structure

```
FarmConnect/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI library (atomic & layout components)
│   │   ├── context/            # Global Auth & Cart Context providers
│   │   ├── layouts/            # DashboardLayout (Sidebar, Header, Role Switcher)
│   │   ├── pages/              # Role-specific route views
│   │   │   ├── admin/          # KYF verification, CMS Hero slides
│   │   │   ├── auth/           # Login, Register, Split-screen hero
│   │   │   ├── customer/       # Channels, Products, Cart, Checkout, Tracking
│   │   │   ├── delivery/       # Pickup pool, Active delivery tracking
│   │   │   └── farmer/         # Channel manager, AI product assist form, Orders
│   │   └── services/           # Mock data and API client configurations
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # MongoDB, Redis, and fallback memory handlers
│   │   ├── controllers/        # Auth, Channel, Order, Delivery, Wallet, AI, Admin
│   │   ├── middleware/         # RBAC, Rate limiters, Error handling
│   │   ├── models/             # Mongoose schemas (Encrypted PII, Atomic counters)
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
│   │   ├── services/           # Gemini AI, Nodemailer, Redis Queue
│   │   ├── sockets/            # Socket.IO room dispatchers
│   │   ├── stateMachines/      # 13-state Order State Machine
│   │   ├── tests/              # Cryptographic & state machine test suites
│   │   └── utils/              # AES-256-GCM, Bcrypt, JWT tokens
│   └── package.json
│
├── docs/                       # Comprehensive Architecture & Role Guides
│   ├── admin/                  # Super Admin KYC & governance docs
│   ├── customer/               # Consumer ordering & wallet guides
│   ├── delivery/               # Driver claim & cold-chain guides
│   ├── farmer/                 # Agricultural channel setup & orders
│   ├── architecture.md         # Full-stack topology & system flow
│   ├── api.md                  # Complete REST API specification
│   ├── authentication.md       # Login ID and JWT token rotation
│   ├── database.md             # Mongoose schemas & atomic operations
│   ├── gemini-integration.md   # AI botanical copywriting integration
│   ├── order-state-machine.md  # 13-state lifecycle & invariant rules
│   ├── queue-system.md         # Redis background worker architecture
│   ├── redis.md                # Caching & memory fallback design
│   ├── security.md             # Cryptography, headers, and RBAC matrix
│   └── socket-events.md        # Real-time WebSocket room contracts
│
├── .env.example                # Baseline environment configuration template
└── package.json                # Root orchestration scripts
```

---

## 📚 In-Depth Documentation

For complete technical specifications, review the [`docs/`](./docs/README.md) directory:
- [System Architecture](./docs/architecture.md)
- [REST API Reference](./docs/api.md)
- [Order State Machine](./docs/order-state-machine.md)
- [Security & PII Encryption](./docs/security.md)
- [Database Models & Atomic Transactions](./docs/database.md)

---

## ⚖️ License

Distributed under the ISC License. Designed and engineered for high-availability agricultural commerce.
