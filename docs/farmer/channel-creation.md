# Farmer Channel Creation & Application Flow

Route: `/customer/create-channel`

## Channel Creation Architecture (Instruction 25)
A logged-in Customer can upgrade to a Farmer Channel without creating a separate login account. The relationship maintained is:

```text
USER
 ├── CUSTOMER PROFILE
 └── FARMER PROFILE
       └── FARMCONNECT CHANNEL
```

## Step-by-Step Creation Wizard
1. **Pre-Creation OTP Verification (Instruction 25)**:
   - Dispatches a 6-digit OTP to the registered mobile number.
   - Prevents unauthorized or fraudulent channel registrations.
2. **Channel ID Generation (Instruction 26)**:
   - Generates a permanent unique identifier format: `FC-CH-0000XXXX`.
   - The database identifier is never derived from mutable channel names.
3. **Farmer & Land Information (Instruction 27)**:
   - Legal Full Name, Contact Number, Alternative Contact, Land Location & Acreage.
   - Encrypted Aadhaar Number via authenticated AES-256-GCM.
4. **Channel Branding**:
   - Channel Name, Short Bio, Detailed Farm Heritage, Banner Cover, and Profile Image.
5. **Encrypted Bank Settlement Details (Instruction 27)**:
   - Account Holder Name, Bank Name, Account Number (encrypted), IFSC Code, UPI ID.
6. **Certifications & Achievements**:
   - NPOP, Jaivik Bharat, FSSAI certificates, and state agricultural honors.
7. **Submission for Admin Verification**:
   - Status transitions to `PENDING_VERIFICATION`.
