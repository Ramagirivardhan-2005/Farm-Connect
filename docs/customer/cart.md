# Multi-Farm Cart System

Route: `/customer/cart`

## Split-Fulfillment Architecture (Instruction 41)
When a customer selects produce from multiple independent farms, FarmConnect automatically partitions the shopping cart by Farmer Channel:

```text
Cart
 ├── Farmer A Batch Order (Dispatched from Farm A Gate)
 └── Farmer B Batch Order (Dispatched from Farm B Gate)
```

## Features
- **Stock Validation**: Live verification that requested quantities do not exceed currently available farm harvest stock.
- **Quantity Controls**: Increment, decrement, and removal with real-time price recomputation.
- **Fulfillment Transparency**: Displays individual dispatch fees (₹40/farm batch) and direct farm origin locations.
