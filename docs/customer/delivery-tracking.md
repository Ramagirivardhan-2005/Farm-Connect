# Real-Time Delivery Tracking

Route: `/order/:orderId/track`

## Real-Time Timeline (Instruction 55)
Customers monitor the progression of their harvest through an interactive visual timeline powered by WebSockets:

```text
✓ Order Placed
  ↓
✓ Payment Confirmed
  ↓
✓ Farmer Accepted
  ↓
✓ Processing (Morning Plucking & Grading)
  ↓
✓ Produce Packed (Eco-Packaging)
  ↓
✓ Ready for Pickup
  ↓
✓ Picked Up (Delivery Partner at Farm Gate)
  ↓
✓ In Transit (Cold-Chain Transit)
  ↓
✓ Out for Delivery (Partner En Route to Doorstep)
  ↓
○ Delivered Fresh
```

## Partner & Farm Routing Information
- Delivery Partner Details: Legal Name, Contact Number, Vehicle Type & License Plate Number, Star Rating, and Total Completed Deliveries.
- Farm Origin: Farm gate pickup location and verification pledge.
- Real-time Socket.IO Events: Pages update instantaneously without manual refresh.
