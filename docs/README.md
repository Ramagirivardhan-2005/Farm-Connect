# FarmConnect Documentation Suite

Welcome to the official technical and operational documentation for **FarmConnect — Direct Farmer-to-Customer Marketplace**.

FarmConnect enables verified farmers to run their own FarmConnect Channels, showcase fresh harvests, accept direct customer orders, manage inventory, coordinate with cold-chain delivery partners, and receive transparent bank settlements without middlemen inflation.

---

## Documentation Directory Structure

### 1. Role-Specific Guides
- **[Customer Documentation](./customer/overview.md)**: Discovery, ordering, escrow wallet, real-time dispatch tracking, and reviews.
- **[Farmer Documentation](./farmer/overview.md)**: Channel establishment, verification, inventory management, order state machine, and payouts.
- **[Delivery Partner Documentation](./delivery/overview.md)**: Atomic order claims, cold-chain pickups, tracking timeline updates, and earnings.
- **[Super Admin Documentation](./admin/overview.md)**: KYC & land verification, CMS management, channel governance, and audit logging.

### 2. Deep Technical Guides
- **[System Architecture](./architecture.md)**: Full-stack topology, client-server-database communications.
- **[Database Schemas & Models](./database.md)**: Mongoose schemas, indexes, and cryptographic protections.
- **[API Reference](./api.md)**: Complete REST API specification for `/api/v1/`.
- **[Authentication & Identity](./authentication.md)**: Unique User ID, Login ID authentication, JWT rotation, and OTP verification.
- **[Security & Cryptography](./security.md)**: Authenticated AES-256-GCM encryption, rate limiting, and RBAC.
- **[Order State Machine](./order-state-machine.md)**: Strict 13-state transition rules and invariant validations.
- **[Real-time WebSockets & Events](./socket-events.md)**: Socket.IO event payloads and channel rooms.
- **[Queue & Background Workers](./queue-system.md)**: Redis-backed queue and asynchronous order processing.
- **[Gemini AI Assistance Layer](./gemini-integration.md)**: Agricultural copywriting and botanical classification assist.
- **[Redis Caching Strategy](./redis.md)**: OTP cooldowns, channel rankings, and cache invalidation.
- **[Cloudinary Media Infrastructure](./cloudinary.md)**: Photo validation, resolution standards, and CDN delivery.
