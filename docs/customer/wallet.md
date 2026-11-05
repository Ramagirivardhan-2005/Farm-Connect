# Secure Purse — Digital Escrow Wallet

Route: `/customer/wallet`

## Wallet Architecture (Instruction 58)
FarmConnect incorporates an escrow-backed **Secure Purse** to facilitate instant checkouts, micro-refunds, and direct customer balance management.

## Immutable Transaction Ledger
To guarantee auditability, the system never relies on a simple mutable balance field alone. Every balance change requires an immutable ledger entry:
- **Transaction ID**: Unique identifier (e.g., `TXN-99821034`).
- **Type**: `CREDIT`, `DEBIT`, or `REFUND`.
- **Amount**: Monetary figure in INR (₹).
- **Balance After**: Cryptographically auditable running balance.
- **Reference**: Associated order or payment gateway transaction.
- **Timestamp**: ISO-8601 creation time.
- **Status**: `SUCCESS`, `PENDING`, or `FAILED`.
