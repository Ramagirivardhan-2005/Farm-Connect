# Accepting Orders & Atomic Pickups

Routes: `/delivery/available` and `/delivery/active`

## Atomic Order Claiming (Instruction 53)
When an order is marked `READY_FOR_PICKUP` by a farmer, it enters the regional pool of available deliveries:
- The Delivery Dashboard displays: Order ID, Farm Gate Location, Destination Address, Distance, Total Weight, and Delivery Payout.
- **Atomic Collision Guard**: Claiming uses MongoDB's atomic `findOneAndUpdate`:
  ```javascript
  Order.findOneAndUpdate(
    { orderId, status: 'READY_FOR_PICKUP', deliveryPartnerId: { $exists: false } },
    { $set: { deliveryPartnerId: partnerId, status: 'PICKED_UP' } },
    { new: true }
  );
  ```
- If two delivery riders attempt to accept the same delivery simultaneously, only one driver succeeds. The second receives a notification that the order was already claimed.
