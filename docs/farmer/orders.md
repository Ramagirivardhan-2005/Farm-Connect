# Farmer Orders & State Machine Workflow

Route: `/farmer/orders`

## Order Filters (Instruction 48)
Farmers filter incoming harvest queues by:
- All Orders
- Pending & Paid Arrivals
- Accepted
- In Harvest / Processing
- Packed
- Ready for Pickup
- Completed / Delivered

## State Machine Action Sequence (Instruction 49)
Farmers advance orders sequentially through strict state machine steps:

1. **New Paid Order**:
   - Action: `[ Accept Order ]` $\rightarrow$ transitions to `ACCEPTED`.
2. **Accepted Order**:
   - Action: `[ Mark as Processing ]` $\rightarrow$ transitions to `PROCESSING` (morning harvest underway).
3. **Processing Order**:
   - Action: `[ Mark as Packed ]` $\rightarrow$ transitions to `PACKED` (eco-packaged and weighed).
4. **Packed Order**:
   - Action: `[ Ready for Pickup ]` $\rightarrow$ transitions to `READY_FOR_PICKUP`.
   - Broadcasts immediate alert to the delivery partner network.
   - Once a delivery partner claims the order, it advances to `PICKED_UP` automatically.
