# Redis Caching & In-Memory Fallback Architecture

FarmConnect uses Redis as an ultra-fast in-memory data store for caching, OTP storage, rate limiting, and asynchronous order queuing. This document covers key architectures, TTL lifecycles, and our robust zero-crash fallback design.

---

## 1. Overview & Connection Architecture

FarmConnect initializes its Redis connection via `ioredis` in `src/config/redis.js`.

To guarantee that the application can always be built, tested, and demonstrated in resource-constrained or local developer environments without an active Redis daemon running, FarmConnect features a transparent **`MemoryRedisFallback`** in-memory simulation.

```
       [Application Request]
                 │
                 ▼
         ┌───────────────┐
         │ Redis Client  │
         └───────┬───────┘
                 │
        Is Redis Server Up?
        ├── YES ──► Live Redis Daemon (ioredis)
        └── NO  ──► MemoryRedisFallback (Map-based with TTL simulation)
```

---

## 2. Key Namespaces and TTL Configuration

All Redis keys adhere to strict prefix namespacing to prevent collisions:

| Namespace / Key Pattern | Purpose | Data Type | Default TTL | Invalidation Trigger |
|---|---|---|---|---|
| `otp:{userId}` | Email / Login OTP verification | String | 300 sec (5 min) | Successful verification or expiry |
| `cms:hero_slides` | Cached active hero carousel slides | JSON String | 3600 sec (1 hr) | Admin creates, edits, or deletes slide |
| `queue:orders` | Pending asynchronous order processing queue | List (FIFO) | Persistent | Consumer dequeues via `blpop` / `lpop` |
| `queue:orders:failed` | Dead-letter queue for failed orders | List | Persistent | Manual resolution or re-queue script |
| `rl:auth:{ip}` | Rate limiting for login / registration | String (counter) | 900 sec (15 min) | Window expiry |
| `rl:otp:{ip}` | Rate limiting for OTP issuance | String (counter) | 900 sec (15 min) | Window expiry |
| `rl:ai:{ip}` | Rate limiting for Gemini AI suggestions | String (counter) | 3600 sec (1 hr) | Window expiry |

---

## 3. In-Memory Fallback Mechanism (`MemoryRedisFallback`)

When Redis is offline, the fallback provides identical async semantics using standard JavaScript `Map` collections and timeout clocks:

```javascript
// src/config/redis.js
class MemoryRedisFallback {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    if (this.isExpired(key)) return null;
    return this.store.get(key) || null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      this.ttls.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.ttls.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async rpush(key, ...values) {
    const list = this.store.get(key) || [];
    list.push(...values);
    this.store.set(key, list);
    return list.length;
  }

  async lpop(key) {
    const list = this.store.get(key) || [];
    const item = list.shift() || null;
    this.store.set(key, list);
    return item;
  }
}
```

This prevents unhandled connection errors from halting the Express server during offline development.

---

## 4. CMS Cache Invalidation Pattern

Hero slides are rendered on high-traffic landing pages. To ensure fast sub-5ms responses while keeping content up-to-date:

1. **Read-Through Cache**:
   ```javascript
   // src/controllers/adminController.js
   const cached = await redis.get('cms:hero_slides');
   if (cached) return res.json(JSON.parse(cached));

   const slides = await HeroContent.find({ isActive: true }).sort({ displayOrder: 1 });
   await redis.set('cms:hero_slides', JSON.stringify(slides), 'EX', 3600);
   return res.json(slides);
   ```

2. **Proactive Invalidation on Mutation**:
   Whenever an admin updates slides via `POST /api/v1/admin/hero-slides` or updates an existing slide:
   ```javascript
   await redis.del('cms:hero_slides');
   ```

---

## 5. Security & Isolation

- **Zero-Credential Logging**: Redis keys containing OTP values or user tokens are never logged to `stdout` or persistent log files.
- **Production Redis Configuration**:
  - Requires auth password via `REDIS_PASSWORD` or `REDIS_URL`.
  - In production, TLS termination should be enabled (`rediss://`).
  - Redis instances should be bound strictly to `127.0.0.1` or a private VPC subnet.
