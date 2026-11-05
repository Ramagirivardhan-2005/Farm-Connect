# Order State Machine Specification

## 13 Lifecycle States (Instruction 47)
The lifecycle of every farm order is governed by a strict, deterministic state machine:

```
CREATED
  ↓
PAID (or PAYMENT_PENDING)
  ↓
ACCEPTED (Farmer Confirms Batch)
  ↓
PROCESSING (Morning Harvest & Grading)
  ↓
PACKED (Eco-Packaging & Quality Check)
  ↓
READY_FOR_PICKUP (Available for Fleet Claim)
  ↓
PICKED_UP (Delivery Partner at Farm Gate)
  ↓
IN_TRANSIT (Cold-Chain Route)
  ↓
OUT_FOR_DELIVERY (Within 3 km of Doorstep)
  ↓
DELIVERED (Doorstep Handover & Payout Settled)
```

## Permissible Transitions Matrix
```javascript
const VALID_TRANSITIONS = {
  CREATED: ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'CANCELLED'],
  PAID: ['ACCEPTED', 'CANCELLED', 'REFUNDED'],
  ACCEPTED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED'],
  PACKED: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [], // Terminal State
  CANCELLED: ['REFUNDED'],
  REFUNDED: [], // Terminal State
};
```

## Enforced Security Invariants
1. **No Backward Jumps**: Transitions like `DELIVERED -> PROCESSING` or `PICKED_UP -> CREATED` strictly throw validation errors.
2. **Terminal Stability**: Once marked `DELIVERED` or `REFUNDED`, no further modifications are permissible.
3. **Audit Trail**: Every state change appends a timestamped log to the order's `statusHistory` array.
