# Cold-Chain Pickup & Doorstep Delivery Workflow

Routes: `/delivery/active` and `/delivery/history`

## Delivery Progression Lifecycle
Once claimed at the farm gate, the delivery partner advances the shipment through subsequent state machine phases:

1. **`PICKED_UP`**: Delivery partner verifies produce batch weight and eco-packaging integrity at the farm gate.
2. **`IN_TRANSIT`**: Shipment loaded into temperature-controlled insulated container and en route to the local distribution zone.
3. **`OUT_FOR_DELIVERY`**: Partner within 3 km of customer doorstep; alerts customer via live WebSocket notification.
4. **`DELIVERED`**: Doorstep handover confirmed; order successfully settled, triggering instant payout credit.

## Delivery History (`/delivery/history`)
Comprehensive logs of completed routes, distance covered, tip earnings, and customer delivery feedback.
