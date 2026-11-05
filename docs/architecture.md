# FarmConnect Full-Stack Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               Client Frontend                │
                    │         React 18 + Tailwind CSS + Vite       │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTPS REST / WSS Socket.IO
                    ┌──────────────────────▼───────────────────────┐
                    │          Express.js Application Server       │
                    │        (Helmet, RBAC, State Machine)         │
                    └──┬──────┬──────────┬───────────┬──────────┬──┘
                       │      │          │           │          │
        ┌──────────────┘      │          │           │          └──────────────┐
        ▼                     ▼          ▼           ▼                         ▼
  ┌───────────┐         ┌───────────┐ ┌────────┐ ┌─────────┐             ┌────────────┐
  │  MongoDB  │         │   Redis   │ │ Socket │ │ Cloud-  │             │   Gemini   │
  │ (Mongoose │         │  (Cache & │ │  .IO   │ │ inary   │             │     AI     │
  │  AES-256) │         │   Queue)  │ │(Events)│ │ (Media) │             │ (Assist)   │
  └───────────┘         └───────────┘ └────────┘ └─────────┘             └────────────┘
```

## System Components
1. **Client (React + Tailwind CSS)**:
   - Single-Page Application with split-screen auth, responsive layouts, role-aware navigation, and dynamic real-time timeline visualizers.
2. **Server (Node.js + Express.js)**:
   - REST API gateway with centralized error handling, Helmet headers, CORS policies, and rate limiting.
3. **Database (MongoDB + Mongoose)**:
   - Document store configured with strict indexing, atomic operators, and AES-256-GCM encryption on sensitive identity fields.
4. **Cache & Queue (Redis)**:
   - In-memory key-value store powering OTP verification cooldowns, CMS hero caching, and background asynchronous order queues.
5. **Real-time Layer (Socket.IO)**:
   - Room-based WebSocket broadcasting for live delivery tracking and farmer order alerts.
6. **AI Assistance Layer (Google Gemini)**:
   - Server-side AI assist providing culinary copywriting, shelf-life modeling, and sensory taste profiles.
