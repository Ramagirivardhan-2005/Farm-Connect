# Inventory Management & Concurrency Control

Route: `/farmer/inventory`

## Dynamic Stock Management
Farmers manage real-time harvest quantities:
- **Available Stock**: Current unallocated produce available for purchase.
- **Total Harvest**: Cumulative crop yield harvested in this seasonal batch.
- **Dispatched Stock**: Produce packaged and handed over to delivery partners.

## Atomic Inventory Reservation (Instruction 77)
To prevent overselling and negative inventory when multiple customers check out simultaneously:
- Decrements are executed using MongoDB atomic `$inc` with query conditions:
  ```javascript
  Inventory.findOneAndUpdate(
    { itemId, availableStock: { $gte: quantity } },
    { $inc: { availableStock: -quantity, soldStock: quantity } }
  );
  ```
- If two customers attempt to purchase the last 1 KG at the exact same millisecond, only one transaction succeeds; the other receives an immediate user-friendly stock error.
