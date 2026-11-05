# Queue System

FarmConnect uses a Redis-backed queue to process orders asynchronously. This decouples the HTTP request/response cycle from time-consuming post-order tasks like sending confirmation emails, updating inventory summaries, and triggering notifications.

---

## 1. Architecture Overview

```
HTTP Request (POST /orders)
        |
        v
   orderController
        |
   Creates Order in MongoDB
        |
   Debits Wallet
        |
   Returns 201 to Client   <--- Fast response
        |
        v
   enqueueOrder(orderId)
        |
        v
   Redis List: "queue:orders"
        |
        v
   Background Worker (polls queue)
        |
   ┌────┴─────────────────────────┐
   │  • Send confirmation email   │
   │  • Update channel analytics  │
   │  • Trigger delivery matching │
   │  • Generate invoice PDF      │
   └──────────────────────────────┘
```

The HTTP response is returned to the client immediately after the order is persisted and wallet debited. Heavy post-processing happens asynchronously in the background worker.

---

## 2. Queue Implementation

### `src/services/queueService.js`

```js
import { redis } from '../config/redis.js';

const QUEUE_KEY = 'queue:orders';

/**
 * Push an order ID to the tail of the order queue.
 * Redis RPUSH is atomic — safe to call from concurrent requests.
 */
export async function enqueueOrder(orderId) {
  await redis.rpush(QUEUE_KEY, orderId);
  console.log(`[Queue] Order enqueued: ${orderId}`);
}

/**
 * Pop an order ID from the head of the queue (blocking, 30s timeout).
 * Returns null if queue is empty after timeout.
 */
export async function dequeueOrder() {
  const result = await redis.blpop(QUEUE_KEY, 30); // blocking pop
  return result ? result[1] : null;
}
```

### Queue Key Structure

| Key | Type | Description |
|---|---|---|
| `queue:orders` | Redis List | FIFO order processing queue |
| `queue:notifications` | Redis List | (Planned) Push notification queue |
| `queue:emails` | Redis List | (Planned) Transactional email queue |

---

## 3. Background Worker (Planned)

The worker runs as a separate process (or a `setInterval` loop in dev):

```js
// src/workers/orderWorker.js
import { dequeueOrder } from '../services/queueService.js';
import { Order } from '../models/Order.js';
import { sendOrderConfirmation } from '../services/emailService.js';

async function processOrder(orderId) {
  const order = await Order.findOne({ orderId }).populate('items.itemId');
  if (!order) return;

  // 1. Send confirmation email
  await sendOrderConfirmation(order);

  // 2. Update channel revenue snapshot
  await updateChannelRevenue(order.channelId, order.totalAmount);

  // 3. Mark order as post-processed
  order.isPostProcessed = true;
  await order.save();
}

async function runWorker() {
  console.log('[Worker] Order worker started');
  while (true) {
    const orderId = await dequeueOrder(); // blocks for up to 30s
    if (orderId) {
      try {
        await processOrder(orderId);
      } catch (err) {
        console.error(`[Worker] Failed to process order ${orderId}:`, err);
        // Re-enqueue with retry count (dead-letter queue pattern)
        await redis.rpush('queue:orders:failed', orderId);
      }
    }
  }
}

runWorker();
```

---

## 4. Redis Fallback Behavior

If Redis is unavailable, the `MemoryRedisFallback` class activates (see [redis.md](./redis.md)). In fallback mode:

- `enqueueOrder` stores the order ID in an in-memory array.
- The worker can still pop from the in-memory queue.
- **Warning**: In-memory queue is lost on server restart. This is acceptable for local development but must not be used in production.

---

## 5. Dead Letter Queue (Planned)

Failed orders are pushed to `queue:orders:failed` for manual retry or investigation:

```js
// Retry failed orders
const failedOrderId = await redis.lpop('queue:orders:failed');
if (failedOrderId) {
  await redis.rpush('queue:orders', failedOrderId); // re-enqueue
}
```

---

## 6. Queue Monitoring

Current queue depth can be queried directly from Redis:

```bash
redis-cli LLEN queue:orders          # pending orders
redis-cli LLEN queue:orders:failed   # failed orders
redis-cli LRANGE queue:orders 0 -1  # list all pending
```

In production, integrate with a monitoring dashboard (Grafana + Redis Exporter) to alert on queue depth > threshold.

---

## 7. Scaling

- Multiple worker processes can consume from the same Redis list safely — Redis BLPOP is atomic.
- To scale horizontally, run N worker processes on N machines. Each order will be processed exactly once.
- For higher throughput, consider migrating to **Bull** or **BullMQ** (Redis-backed job queues with retry, priority, delayed jobs, and a UI dashboard).

---

## 8. Production Recommendations

| Concern | Recommendation |
|---|---|
| Durability | Enable Redis AOF persistence so the queue survives restarts |
| Dead letters | Implement a retry strategy with exponential backoff (max 3 retries) |
| Visibility timeout | Use a worker heartbeat to detect stuck jobs and re-enqueue |
| Observability | Log job start, completion, and failure with structured logs |
| Migration path | Consider BullMQ for production-grade job processing features |
