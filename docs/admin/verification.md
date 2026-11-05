# Farmer Channel Verification (KYF)

Route: `/admin/verifications`

## Verification Review Checklist (Instruction 69)
Admins inspect each channel application across four verification dimensions:
1. **Farmer Identity**:
   - Legal Name and Verified Contact Number.
   - Encrypted Aadhaar verification status (cryptographically confirmed via AES-256-GCM without exposing raw PII).
2. **Agricultural Land & Farming Method**:
   - Village, Tehsil, and District land records.
   - Declared cultivation method (Organic, Natural / ZBNF, Hydroponic).
3. **Certifications & Accreditations**:
   - NPOP / Jaivik Bharat / APEDA license numbers, issuing authority, and expiry dates.
4. **Bank Account Verification**:
   - Penny-drop settlement verification of Account Holder Name, IFSC Code, and Bank Name.

## Administrative Actions
- **`Approve & Activate Channel`**: Promotes status to `VERIFIED` / `ACTIVE`; channel immediately surfaces in customer discovery.
- **`Request Land Title Changes`**: Sends structured change requests back to the farmer.
- **`Reject Application`**: Rejects submission with clear reason codes.
- **`Suspend Channel`**: Temporarily pulls channel from customer view during disputes.
