# Security Architecture

FarmConnect is built with a defense-in-depth security model. This document covers every layer of the security stack from transport to database.

---

## 1. Transport Security

### HTTPS / TLS
All production traffic must be served over HTTPS. The Express server itself handles HTTP; TLS termination should occur at the reverse proxy (nginx) or load balancer level.

### HTTP Security Headers (Helmet)
`helmet` is applied globally in `app.js`:

```js
app.use(helmet());
```

This sets the following headers automatically:
| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-XSS-Protection` | `0` (modern browser CSP replaces this) |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` |
| `Content-Security-Policy` | Restricts script/style sources |
| `Referrer-Policy` | `no-referrer` |

### CORS
Only the configured client origin is allowed:

```js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

## 2. Authentication

### Primary Identifier — Login ID
Accounts use a **Login ID** (e.g., `RV10241`) as the primary login credential, not email. This prevents credential stuffing from data breaches of other services where the user may reuse their email.

See [authentication.md](./authentication.md) for the full auth flow.

### Password Hashing — bcrypt (12 rounds)

```js
// src/utils/password.js
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
```

- 12 rounds means ≈ 250ms per hash on modern hardware — fast enough for UX, expensive enough to resist brute force.
- Plaintext passwords are **never stored, logged, or transmitted** after the initial hash.

### JWT — Short-Lived Access + Rotating Refresh

| Token | Lifetime | Storage |
|---|---|---|
| Access Token | 15 minutes | HTTP-only cookie |
| Refresh Token | 7 days | HTTP-only cookie |

- Access tokens are signed with `JWT_ACCESS_SECRET` and expire quickly to limit the blast radius of theft.
- Refresh tokens include a `tokenVersion` field. Incrementing `user.tokenVersion` in MongoDB instantly invalidates **all** active refresh tokens for that user (logout-all-devices).
- Both tokens are stored as `HttpOnly; Secure; SameSite=Strict` cookies — inaccessible to JavaScript, preventing XSS token theft.

### OTP Security

- 6-digit OTPs are generated using `crypto.randomInt(100000, 999999)`.
- Stored in Redis with a **5-minute TTL** key: `otp:{userId}`.
- Rate-limited to 5 OTP requests per 15 minutes per IP (`otpLimiter`).
- OTP values are **never written to logs or the database**.
- `123456` is a master bypass code for test environments only — guarded by `NODE_ENV !== 'production'`.

---

## 3. PII Encryption — AES-256-GCM

Sensitive personally-identifiable information (PII) is encrypted at the application layer before being stored in MongoDB.

### Fields Encrypted

| Model | Field | Reason |
|---|---|---|
| `FarmerProfile` | `aadhaarEncrypted` | Indian national ID |
| `FarmerProfile` | `bankAccount.accountNumber` | Financial |
| `FarmerProfile` | `bankAccount.ifscCode` | Financial |

### Implementation (`src/utils/crypto.js`)

```js
const ALGORITHM = 'aes-256-gcm';

export function encryptSensitive(plaintext) {
  const iv = crypto.randomBytes(12); // 96-bit IV per GCM spec
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}
```

- **AES-256-GCM** provides both confidentiality (AES) and integrity (GCM auth tag). An attacker who modifies the ciphertext will receive an authentication error on decryption.
- Each encryption call generates a fresh random IV — identical plaintexts produce different ciphertexts (no pattern leakage).
- The encryption key (`ENCRYPTION_KEY`) must be a 64-character hex string (32 bytes). It must be stored in a secrets manager (AWS Secrets Manager, GCP Secret Manager) in production — never committed to source control.

### PII Masking for Logs

```js
export function maskSensitive(value) {
  if (!value || value.length < 8) return '***';
  return value.substring(0, 4) + '****' + value.slice(-2);
}
```

Any logging of sensitive fields (for debugging) **must** use `maskSensitive()`.

---

## 4. Authorization — RBAC

Role-Based Access Control is enforced at the route level via middleware.

```js
// src/middleware/authMiddleware.js
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403));
  }
  next();
};
```

### Role Matrix

| Route Group | Allowed Roles |
|---|---|
| `/api/v1/channels` (read) | PUBLIC |
| `/api/v1/channels` (create) | FARMER |
| `/api/v1/orders` (create) | CUSTOMER |
| `/api/v1/orders` (update status) | FARMER, DELIVERY |
| `/api/v1/delivery` | DELIVERY |
| `/api/v1/wallet` | CUSTOMER, FARMER |
| `/api/v1/ai/*` | FARMER |
| `/api/v1/admin/*` | ADMIN |

---

## 5. Rate Limiting

Three tiers of rate limiting are applied via `express-rate-limit`:

```js
// src/middleware/rateLimiter.js
export const authLimiter    = rateLimit({ windowMs: 15min, max: 10  }); // login/register
export const otpLimiter     = rateLimit({ windowMs: 15min, max: 5   }); // OTP requests
export const aiLimiter      = rateLimit({ windowMs: 60min, max: 20  }); // Gemini AI calls
```

Rate limit state is stored in Redis so limits are enforced across multiple Node.js instances (horizontal scaling).

---

## 6. Audit Logging

All privileged operations are recorded in the `AuditLog` collection:

```js
await AuditLog.create({
  actorId: req.user._id,
  actorRole: req.user.role,
  action: 'CHANNEL_APPROVED',
  targetType: 'Channel',
  targetId: channel._id,
  metadata: { decision, notes },
  ip: req.ip,
  userAgent: req.get('User-Agent'),
});
```

Audit logs are append-only. No update or delete operations are permitted on `AuditLog` documents.

---

## 7. Input Sanitization

### AI Endpoint
The `/api/v1/ai/product-assist` controller strips HTML and limits prompt length before forwarding to Gemini:

```js
const sanitized = input.replace(/<[^>]*>/g, '').substring(0, 500);
```

### MongoDB — No Raw Queries
All database operations use Mongoose's parameterized query API. Raw MongoDB `$where` and JavaScript expression operators are never used, preventing NoSQL injection.

---

## 8. Zero-Credential Logging Policy

The following values are **never written to any log, console, or error message**:
- Plaintext passwords
- OTP codes (except the master bypass in `NODE_ENV=test` environments)
- JWT tokens
- Aadhaar numbers
- Bank account numbers
- Encryption keys

Violation of this policy should be treated as a security incident.

---

## 9. Production Hardening Checklist

- [ ] Replace `.env` with a managed secrets service
- [ ] Enable MongoDB authentication and TLS
- [ ] Set `ENCRYPTION_KEY` to a randomly generated 64-character hex string
- [ ] Configure Redis `requirepass` and TLS
- [ ] Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to 64+ character random strings
- [ ] Enable HTTPS at the load balancer / reverse proxy
- [ ] Set `NODE_ENV=production` to disable master OTP bypass
- [ ] Review and tighten the CSP header in Helmet configuration
- [ ] Enable MongoDB field-level encryption for additional PII fields
- [ ] Configure structured logging (e.g., Winston + CloudWatch) with PII filtering
