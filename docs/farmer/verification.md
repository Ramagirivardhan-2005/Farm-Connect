# Channel Verification Lifecycle

## Verification States (Instruction 28)
Every channel strictly progresses through one of the following lifecycle states:

```text
DRAFT
  ↓
PENDING_VERIFICATION
  ↓
VERIFIED
  ↓
ACTIVE  ↔  SUSPENDED / DEACTIVATED / REJECTED
```

- **DRAFT**: Channel information is being compiled by the farmer.
- **PENDING_VERIFICATION**: Submitted for Super Admin KYC and agricultural document review.
- **VERIFIED**: Identity and land proofs approved by district admins.
- **ACTIVE**: Channel is publicly discoverable and eligible for direct customer sales.
- **SUSPENDED**: Temporarily withheld from discovery due to quality or customer dispute review.
- **REJECTED**: Application rejected with explicit change request reasons.
- **DEACTIVATED**: Voluntarily disabled by farmer or permanently closed by admin.

## Normal Discovery Invariant
Any channel in `SUSPENDED`, `DEACTIVATED`, `DRAFT`, or `REJECTED` status is completely excluded from customer search and recommendations. Existing in-flight orders continue to follow business rules and are never deleted.
