# Socket.IO Events Reference

FarmConnect uses Socket.IO for real-time delivery tracking and channel activity notifications. This document describes all socket events, room naming conventions, and connection lifecycle.

---

## 1. Server Setup

The Socket.IO server is attached to the same HTTP server as Express:

```js
// src/server.js
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

io.on('connection', (socket) => socketHandler(io, socket));
```

The `io` instance is attached to `app.locals.io` so controllers can emit events:

```js
app.locals.io = io;
// In controller:
req.app.locals.io.to(`order:${orderId}`).emit('order.status_updated', payload);
```

---

## 2. Room Naming Convention

| Room Name | Description |
|---|---|
| `order:{orderId}` | All parties interested in one order's status |
| `channel:{channelId}` | Subscribers of a farmer channel |
| `admin` | Admin dashboard live metrics |

Room names use **colon-separated prefixes** to namespace by entity type. The entity ID uses the application-level ID (e.g., `FC-CH-00001245`), not the MongoDB `_id`.

---

## 3. Client → Server Events (Emit)

### `subscribe:order`

Join the real-time room for a specific order. Called when the customer opens the Delivery Tracking page.

```js
// Client
socket.emit('subscribe:order', { orderId: 'FC-ORD-00012345' });
```

**Server handler:**
```js
socket.on('subscribe:order', ({ orderId }) => {
  socket.join(`order:${orderId}`);
  console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
});
```

---

### `subscribe:channel`

Join the real-time room for a farmer channel. Used for live post notifications and inventory updates.

```js
// Client
socket.emit('subscribe:channel', { channelId: 'FC-CH-00001245' });
```

**Server handler:**
```js
socket.on('subscribe:channel', ({ channelId }) => {
  socket.join(`channel:${channelId}`);
});
```

---

### `unsubscribe:order` / `unsubscribe:channel`

Leave a room when the user navigates away.

```js
socket.emit('unsubscribe:order', { orderId });
socket.emit('unsubscribe:channel', { channelId });
```

---

## 4. Server → Client Events (Broadcast)

### `order.status_updated`

Emitted whenever an order's status changes via `PATCH /api/v1/orders/:orderId/status`.

**Target room**: `order:{orderId}`

**Payload:**
```json
{
  "orderId": "FC-ORD-00012345",
  "status": "OUT_FOR_DELIVERY",
  "updatedAt": "2024-01-15T10:30:00Z",
  "updatedBy": {
    "role": "DELIVERY",
    "name": "Ravi Kumar"
  },
  "note": "Package picked up from warehouse"
}
```

**Emitted from controller:**
```js
req.app.locals.io
  .to(`order:${order.orderId}`)
  .emit('order.status_updated', {
    orderId: order.orderId,
    status: order.status,
    updatedAt: order.updatedAt,
    updatedBy: { role: req.user.role, name: req.user.name },
  });
```

**Client handler (DeliveryTrackingPage):**
```js
useEffect(() => {
  socket.emit('subscribe:order', { orderId });
  socket.on('order.status_updated', (data) => {
    setCurrentStatus(data.status);
    // Update timeline UI
  });
  return () => socket.off('order.status_updated');
}, [orderId]);
```

---

### `channel.new_post`

Emitted when a farmer publishes a new post or product update.

**Target room**: `channel:{channelId}`

**Payload:**
```json
{
  "channelId": "FC-CH-00001245",
  "type": "NEW_PRODUCT",
  "title": "Fresh Alphonso Mangoes — Season Opening",
  "preview": "First harvest of the season now available...",
  "timestamp": "2024-01-15T08:00:00Z"
}
```

---

### `channel.inventory_alert`

Emitted when a product's available stock drops below a threshold (configurable, default 10 units).

**Target room**: `channel:{channelId}`

**Payload:**
```json
{
  "channelId": "FC-CH-00001245",
  "itemId": "60f7a9b8c8d1e234567890ab",
  "itemName": "Alphonso Mangoes",
  "remainingStock": 8,
  "unit": "kg"
}
```

---

### `admin.metrics_update`

Emitted every 60 seconds to the `admin` room with updated platform metrics.

**Target room**: `admin`

**Payload:**
```json
{
  "totalOrders": 1284,
  "pendingVerifications": 7,
  "activeDeliveries": 23,
  "platformRevenue": 284000
}
```

---

## 5. Connection Lifecycle

```
Client                             Server
  |                                  |
  |--- connect ---------------------->|  Socket assigned socket.id
  |                                  |
  |--- subscribe:order {orderId} --->|  socket.join('order:FC-ORD-00012345')
  |                                  |
  |<-- order.status_updated ---------|  Broadcast from controller on status change
  |                                  |
  |--- unsubscribe:order ----------->|  socket.leave('order:FC-ORD-00012345')
  |                                  |
  |--- disconnect ------------------>|  Auto-leave all rooms
```

Socket.IO handles reconnection automatically with exponential backoff. On reconnect, the client must re-emit `subscribe:*` events because room membership does not persist across disconnections.

---

## 6. Client Socket Setup

```js
// src/services/socket.js (example)
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
```

Connect on login, disconnect on logout:

```js
// AuthContext
const login = async (...) => {
  // ... JWT auth ...
  socket.connect();
};

const logout = () => {
  socket.disconnect();
};
```

---

## 7. Scaling Considerations

When running multiple Node.js instances, Socket.IO rooms are process-local. To broadcast across instances, configure the **Socket.IO Redis Adapter**:

```js
const { createAdapter } = require('@socket.io/redis-adapter');
io.adapter(createAdapter(pubClient, subClient));
```

This uses Redis Pub/Sub to relay room broadcasts between all server processes.
