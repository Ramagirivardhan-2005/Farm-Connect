# Customer Orders Management

Route: `/customer/orders` and `/customer/orders/:orderId`

## Orders Overview (Instruction 57)
The Customer Orders view displays historical and active orders as cards containing:
- Permanent Order ID (e.g., `ORD-2026-91823`)
- Farm Produce list (Names, quantities, units)
- Total Amount Paid
- Placement Date & Time
- Live Status Badge (mapped to Order State Machine)
- Expected Delivery Date (calculated by lead time formula)
- Direct Actions: "Track Live Delivery" and "Order Details"
