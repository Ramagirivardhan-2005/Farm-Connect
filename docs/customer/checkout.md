# Checkout & Expected Delivery Calculation

Route: `/customer/checkout`

## Checkout Workflow (Instruction 43)
```text
Cart → Address Selection → Order Breakdown → Payment Choice → Idempotent Order Creation
```

## Mandatory Address Selection (Instruction 42)
Selecting a verified delivery address is mandatory before checkout can proceed.
- Address Fields: Full Name, Mobile Number, House/Flat, Street, Village/Town, District, State, Pincode, Landmark, and Address Type (Home, Work, Other).
- Customers can add, edit, select, and manage multiple saved addresses.

## Expected Delivery Date Formula (Instruction 44)
To eliminate misleading delivery promises, FarmConnect computes expected delivery dates deterministically using genuine agricultural lead times:

$$\text{Expected Delivery Date} = \text{Order Placement Time} + \text{Harvest/Pack Lead Time} + \text{Transit Time}$$

- **Harvest & Eco-Packing Lead Time**: Typically 1 day (morning plucking & grading).
- **Cold-Chain Transit Time**: 1 to 2 days based on district distance.
- The calculated date is persisted in MongoDB so the customer's promised timeline never shifts unexpectedly.

## Idempotency Guard (Instruction 78)
Every checkout request generates a unique cryptographic `idempotencyKey`. If a customer double-clicks "Pay" or a network retry occurs, the backend deduplicates the transaction and prevents double order creation.
