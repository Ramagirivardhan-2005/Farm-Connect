# Security & Audit Logging

Route: `/admin/audit-logs`

## Security Invariants (Instruction 76)
FarmConnect enforces a strict **Zero-Credential Logging Policy**:
- Passwords, OTP codes, raw JWT tokens, Aadhaar numbers, and bank account numbers are NEVER logged into application logs, console streams, or audit collections.

## Audited Operational Events
Every critical state transition and administrative intervention is recorded in the `AuditLog` collection:
- `USER_LOGIN` and `USER_LOGOUT`
- `PASSWORD_CHANGE`
- `CHANNEL_VERIFIED`, `CHANNEL_SUSPENDED`, `CHANNEL_DEACTIVATED`
- `ORDER_STATE_TRANSITION` (e.g., `PACKED` $\rightarrow$ `READY_FOR_PICKUP`)
- `DELIVERY_CLAIMED`
- `WALLET_TOPUP` and `WALLET_PAYMENT`
- `ADMIN_CMS_UPDATE`
