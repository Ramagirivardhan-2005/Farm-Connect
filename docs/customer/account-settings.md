# Customer Account Settings

Route: `/customer/settings`

## Settings & Privacy (Instruction 61)
The Account Settings section allows customers to manage their profile, saved delivery destinations, and notification preferences.

## Sensitive Profile Modifications
Modifications to critical identity and contact attributes require dual-factor OTP verification:
- **Mobile Number Changes**: Must be verified via mobile OTP prior to persisting.
- **Email Address Updates**: Dispatches verification code to new email.
- **Password Changes**: Requires verification of current password hash.
