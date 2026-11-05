# Customer Authentication & Identity

FarmConnect implements a modern split-screen authentication architecture with strict security standards.

## 1. Unique User ID
Every registered customer is assigned a globally unique permanent identification code (e.g., `RV10241`):
- Composed of customer initials plus a unique 5-digit number.
- Enforced with a unique MongoDB index on `User.userId`.
- Used as the primary login identifier instead of email.

## 2. Login Flow (`/login`)
- **Left Side (55-60%)**: High-resolution promotional carousel managed dynamically by Super Admin via the Hero Content CMS.
- **Right Side (40-45%)**: Centered FarmConnect logo, Login ID input, password input, and Google OAuth 2.0 alternative.
- **Role Redirection**: Upon successful JWT validation, customers are redirected to `/customer/dashboard`.

## 3. Email & Mobile OTP Verification
- During registration, an encrypted 6-digit OTP is transmitted via Nodemailer SMTP.
- Validated with rate limiting (maximum 5 attempts per 10 minutes) and 5-minute expiry in Redis.
- Plaintext OTPs are never logged in console or database records.
