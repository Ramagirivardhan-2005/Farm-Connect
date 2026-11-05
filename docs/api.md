# REST API Reference

All endpoints are prefixed with `/api/v1`. The server runs on port `5000` by default.

**Base URL (development):** `http://localhost:5000/api/v1`

---

## Authentication

Most endpoints require a valid JWT access token sent as an `HttpOnly` cookie named `accessToken`. Public endpoints are marked *(Public)*.

---

## 1. Auth Routes

### `POST /auth/register` *(Public)*

Register a new account.

**Request body:**
```json
{
  "name": "Ramesh Verma",
  "email": "ramesh@example.com",
  "password": "SecurePass123!",
  "role": "CUSTOMER"
}
```

**Response `201`:**
```json
{
  "success": true,
  "loginId": "RV10241",
  "message": "Account created. OTP sent to your email."
}
```

---

### `POST /auth/login` *(Public)*

Login with Login ID and password.

**Request body:**
```json
{
  "loginId": "RV10241",
  "password": "SecurePass123!"
}
```

**Response `200`:** Sets `accessToken` and `refreshToken` HttpOnly cookies.
```json
{
  "success": true,
  "user": {
    "userId": "RV10241",
    "name": "Ramesh Verma",
    "role": "CUSTOMER"
  }
}
```

---

### `POST /auth/request-otp`

Request a new OTP for email verification.

**Request body:**
```json
{ "userId": "RV10241" }
```

**Rate limit:** 5 requests / 15 minutes per IP.

---

### `POST /auth/verify-otp`

Verify an OTP to activate account or confirm email.

**Request body:**
```json
{ "userId": "RV10241", "otp": "483921" }
```

**Response `200`:** `{ "success": true, "message": "Email verified." }`

---

### `POST /auth/refresh`

Issue a new access token using the refresh token cookie.

**Response `200`:** Sets new `accessToken` cookie.

---

### `POST /auth/logout`

Clear all auth cookies.

**Response `200`:** `{ "success": true }`

---

## 2. Channel Routes

### `GET /channels` *(Public)*

List all active, verified channels sorted by Bayesian rating.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by farm category (e.g., `Fruits`) |
| `search` | string | Full-text search on name/description |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |

**Response `200`:**
```json
{
  "channels": [
    {
      "channelId": "FC-CH-00001245",
      "name": "Green Valley Organics",
      "category": "Vegetables",
      "rating": 4.8,
      "reviewCount": 312,
      "bayesianScore": 4.73,
      "subscriberCount": 1840,
      "isVerified": true,
      "avatarUrl": "https://res.cloudinary.com/...",
      "bannerUrl": "https://res.cloudinary.com/..."
    }
  ],
  "total": 47,
  "page": 1,
  "pages": 3
}
```

---

### `GET /channels/:channelId` *(Public)*

Get full channel detail including products and certificates.

**Response `200`:**
```json
{
  "channel": {
    "channelId": "FC-CH-00001245",
    "name": "Green Valley Organics",
    "description": "...",
    "farmerName": "Suresh Patel",
    "location": "Nashik, Maharashtra",
    "certifications": ["Organic India", "FSSAI"],
    "products": [...],
    "posts": [...]
  }
}
```

---

### `POST /channels` *(FARMER)*

Create a new farmer channel.

**Request body:**
```json
{
  "name": "Sunrise Farms",
  "description": "Fresh produce from the Deccan plateau",
  "category": "Mixed",
  "location": "Pune, Maharashtra",
  "aadhaar": "1234-5678-9012",
  "bankAccount": { "accountNumber": "9876543210", "ifscCode": "SBIN0001234", "holderName": "Ramesh" }
}
```

**Response `201`:** Returns created channel with generated `channelId`.

---

## 3. Order Routes

### `POST /orders` *(CUSTOMER)*

Place a new order with idempotency support.

**Request body:**
```json
{
  "channelId": "FC-CH-00001245",
  "items": [
    { "itemId": "...", "quantity": 2 }
  ],
  "deliveryAddress": {
    "line1": "42 MG Road",
    "city": "Pune",
    "pincode": "411001"
  },
  "paymentMethod": "WALLET",
  "idempotencyKey": "order-uuid-1234"
}
```

The server:
1. Checks for duplicate `idempotencyKey` — returns existing order if found.
2. Atomically reserves inventory.
3. Debits wallet if `paymentMethod === 'WALLET'`.
4. Calculates expected delivery as placement + 2 days.

**Response `201`:**
```json
{
  "order": {
    "orderId": "FC-ORD-00012345",
    "status": "PLACED",
    "totalAmount": 480,
    "expectedDelivery": "2024-01-17T00:00:00Z"
  }
}
```

---

### `GET /orders` *(CUSTOMER / FARMER)*

List orders for the authenticated user.

**Query params:**
| Param | Description |
|---|---|
| `status` | Filter by order status |
| `page` | Page number |
| `limit` | Items per page |

---

### `PATCH /orders/:orderId/status` *(FARMER / DELIVERY)*

Advance order status through the state machine.

**Request body:**
```json
{ "status": "PACKED", "note": "Ready for pickup" }
```

Illegal transitions (e.g., `DELIVERED → PROCESSING`) return `400 Bad Request`. Valid transitions are enforced by `OrderStateMachine.validateTransition()`.

Emits `order.status_updated` to Socket.IO room `order:{orderId}`.

---

## 4. Delivery Routes

### `GET /delivery/pickups` *(DELIVERY)*

List orders in `PACKED` state available for pickup.

**Response `200`:** Array of available orders with channel location.

---

### `POST /delivery/pickups/:orderId/claim` *(DELIVERY)*

Atomically claim an order for delivery.

Uses `findOneAndUpdate` with `{ deliveryPartnerId: { $exists: false } }` guard — only one delivery partner can claim.

**Response `200`:** Updated order with delivery partner assigned.
**Response `409`:** Order already claimed.

---

## 5. Wallet Routes

### `GET /wallet/balance` *(CUSTOMER / FARMER)*

Get current wallet balance and recent transactions.

**Response `200`:**
```json
{
  "balance": 1250.00,
  "transactions": [
    {
      "type": "DEBIT",
      "amount": 480,
      "description": "Order FC-ORD-00012345",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### `POST /wallet/add-funds` *(CUSTOMER)*

Add funds to wallet (UPI / Card simulation).

**Request body:**
```json
{ "amount": 1000, "paymentMethod": "UPI" }
```

Creates a `CREDIT` transaction and updates wallet balance atomically.

---

## 6. AI Routes

### `POST /ai/product-assist` *(FARMER)*

Get AI-generated suggestions for a product listing.

**Rate limit:** 20 requests / 60 minutes per IP.

**Request body:**
```json
{
  "productName": "Alphonso Mangoes",
  "category": "Fruits",
  "additionalContext": "Grown in Ratnagiri, harvested last week"
}
```

**Response `200`:**
```json
{
  "suggestions": {
    "description": "Premium Ratnagiri Alphonso Mangoes...",
    "suggestedPrice": { "min": 350, "max": 500, "unit": "per dozen" },
    "nutritionalHighlights": ["Rich in Vitamin C", "High antioxidant content"],
    "bestUsedFor": ["Fresh eating", "Mango lassi", "Aamras"],
    "storageInstructions": "Store at room temperature until ripe, then refrigerate.",
    "tags": ["organic", "seasonal", "GI-tagged"]
  }
}
```

If the Gemini API key is not configured, high-quality heuristic suggestions are returned based on the product category.

---

## 7. Admin Routes

All admin routes require `role: ADMIN`.

### `GET /admin/metrics`

Platform dashboard metrics.

**Response `200`:**
```json
{
  "totalUsers": 4821,
  "totalChannels": 312,
  "totalOrders": 18420,
  "pendingVerifications": 7,
  "platformRevenue": 2840000,
  "activeDeliveries": 23
}
```

---

### `GET /admin/verifications`

List channels pending KYF (Know Your Farmer) verification.

**Response `200`:** Array of channels with `status: 'PENDING_VERIFICATION'` with attached farmer documents.

---

### `PATCH /admin/verifications/:channelId`

Approve, request changes, or reject a channel.

**Request body:**
```json
{
  "decision": "APPROVED",
  "notes": "All documents verified, farm location confirmed."
}
```

Valid decisions: `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`.

Creates an `AuditLog` entry for every decision.

---

### `GET /admin/hero-slides`

Get all hero carousel slides. Results cached in Redis for 1 hour (`cms:hero_slides`).

---

### `POST /admin/hero-slides`

Create a new hero slide. Invalidates `cms:hero_slides` cache.

**Request body:**
```json
{
  "title": "Fresh Harvest Season",
  "subtitle": "Discover verified farmers near you",
  "imageUrl": "https://res.cloudinary.com/...",
  "ctaText": "Explore Channels",
  "ctaLink": "/channels",
  "isActive": true
}
```

---

## 8. Error Responses

All errors follow a consistent schema:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required.",
    "statusCode": 401
  }
}
```

| Status | Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Invalid request body |
| `400` | `ILLEGAL_TRANSITION` | Invalid order state machine transition |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |
| `403` | `FORBIDDEN` | Insufficient role permissions |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Duplicate idempotency key or concurrent claim |
| `422` | `INSUFFICIENT_STOCK` | Inventory reservation failed |
| `429` | `RATE_LIMITED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Unexpected server error |
