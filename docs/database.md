# Database Schema & Mongoose Architecture

FarmConnect uses MongoDB with Mongoose ODM as its primary persistence engine. This document details collection schemas, indexes, atomic locking patterns, and connection durability strategies.

---

## 1. Architecture & Connection Resilience

Database connections are managed via `src/config/database.js`.

To support standalone developer setup and automated offline test runners, the Mongoose connector logs errors cleanly with fallback alerts without abruptly crashing the application process.

```javascript
// src/config/database.js
export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('[MongoDB] Connection failed. Fallback to mock mode enabled.');
  }
}
```

---

## 2. Entity Schemas & Relationships

```
 ┌──────────────┐          1:1          ┌───────────────────┐
 │     User     ├──────────────────────►│   FarmerProfile   │
 └──────┬───────┘                       └─────────┬─────────┘
        │                                         │
        │ 1:N                                     │ 1:1
        ▼                                         ▼
 ┌──────────────┐                       ┌───────────────────┐
 │    Order     │                       │      Channel      │
 └──────┬───────┘                       └─────────┬─────────┘
        │                                         │
        │ N:M                                     │ 1:N
        ▼                                         ▼
 ┌──────────────┐                       ┌───────────────────┐
 │     Item     │◄──────────────────────┤     Inventory     │
 └──────────────┘          1:1          └───────────────────┘
```

---

## 3. Core Models & Definitions

### 3.1. `User` Model (`src/models/User.js`)
- `userId`: String, unique index (e.g., `RV10241` format).
- `name`: String, trimmed.
- `email`: String, lowercase, unique index.
- `passwordHash`: String, bcrypt 12-round hash.
- `role`: Enum `['CUSTOMER', 'FARMER', 'DELIVERY', 'ADMIN']`, default `'CUSTOMER'`.
- `farmerProfileId`: ObjectId ref to `FarmerProfile` (nullable).
- `tokenVersion`: Number, incremented to invalidate JWT refresh tokens.
- `isEmailVerified`: Boolean, default `false`.

### 3.2. `FarmerProfile` Model (`src/models/FarmerProfile.js`)
- `userId`: ObjectId ref to `User`, unique.
- `aadhaarEncrypted`: AES-256-GCM encrypted format (`iv:authTag:ciphertext`).
- `farmName`: String.
- `farmLocation`: Object `{ address, city, state, pincode, coordinates: [lng, lat] }`.
- `bankAccount`: Object `{ holderName, accountNumber (encrypted), ifscCode (encrypted), bankName }`.
- `verificationStatus`: Enum `['NOT_SUBMITTED', 'PENDING_VERIFICATION', 'VERIFIED', 'CHANGES_REQUESTED', 'REJECTED']`.

### 3.3. `Channel` Model (`src/models/Channel.js`)
- `channelId`: String, unique format `FC-CH-0000XXXX`.
- `farmerProfileId`: ObjectId ref to `FarmerProfile`.
- `name`: String.
- `tagline`: String.
- `about`: String.
- `avatarUrl`: String.
- `bannerUrl`: String.
- `category`: String enum.
- `rating`: Number, default `0.0`.
- `reviewCount`: Number, default `0`.
- `subscriberCount`: Number, default `0`.
- `pinnedItems`: Array of ObjectId refs to `Item`.
- `isVerified`: Boolean, indexed.

### 3.4. `Item` & `Inventory` Models (`src/models/Item.js`, `src/models/Inventory.js`)
- `Item`: Represents product catalogue metadata (`title`, `description`, `price`, `unit`, `category`, `harvestDate`, `channelId`).
- `Inventory`: Tracks stock isolation separately to prevent write contention on item catalogue records:
  - `itemId`: ObjectId ref to `Item`, unique index.
  - `channelId`: ObjectId ref to `Channel`.
  - `totalStock`: Number.
  - `availableStock`: Number.
  - `reservedStock`: Number.
  - `soldStock`: Number.

---

## 4. Atomic Concurrency & Safe State Mutations

### Atomic Inventory Reservation
To prevent overselling during high-concurrency flash sales, FarmConnect uses atomic conditional updates with `$gte` predicates:

```javascript
// src/models/Inventory.js
inventorySchema.statics.atomicReserveStock = async function(itemId, quantity) {
  return await this.findOneAndUpdate(
    {
      itemId,
      availableStock: { $gte: quantity } // Concurrency Guard
    },
    {
      $inc: {
        availableStock: -quantity,
        reservedStock: quantity
      }
    },
    { new: true }
  );
};
```
If `atomicReserveStock` returns `null`, the inventory reservation is aborted and an `INSUFFICIENT_STOCK` error (`422`) is thrown without partial state mutations.

### Atomic Delivery Assignment Guard
When a delivery driver claims a packaged order, atomic validation ensures race conditions between drivers are avoided:

```javascript
// src/controllers/deliveryController.js
const order = await Order.findOneAndUpdate(
  {
    orderId,
    status: 'PACKED',
    deliveryPartnerId: { $exists: false } // Only claim unassigned orders
  },
  {
    $set: {
      deliveryPartnerId: req.user._id,
      status: 'OUT_FOR_DELIVERY'
    }
  },
  { new: true }
);
```

---

## 5. Double-Entry Ledger Pattern (`Wallet` & `WalletTransaction`)

To protect customer and farmer funds, wallet balances are maintained alongside a strictly append-only transaction ledger:

```javascript
// Atomically update balance and commit transaction
await Wallet.findOneAndUpdate(
  { userId: order.customerId, balance: { $gte: order.totalAmount } },
  { $inc: { balance: -order.totalAmount } }
);

await WalletTransaction.create({
  walletId: wallet._id,
  type: 'DEBIT',
  amount: order.totalAmount,
  referenceId: order.orderId,
  description: `Payment for Order #${order.orderId}`
});
```

---

## 6. Indexing Strategy

| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| `users` | `userId` | Unique | Fast login ID lookups |
| `users` | `email` | Unique | Prevents duplicate accounts |
| `channels` | `channelId` | Unique | Public URL routing |
| `channels` | `isVerified`, `rating`, `reviewCount` | Compound | Bayesian ranking algorithm |
| `orders` | `orderId` | Unique | Order tracking lookups |
| `orders` | `idempotencyKey` | Unique (sparse) | Prevents duplicate order submissions |
| `orders` | `customerId`, `createdAt` | Compound | Customer order history pagination |
| `orders` | `channelId`, `status` | Compound | Farmer order dashboard filtering |
| `inventories`| `itemId` | Unique | Atomic inventory operations |
| `audit_logs`| `targetId`, `action`, `createdAt` | Compound | Security audits and governance |
