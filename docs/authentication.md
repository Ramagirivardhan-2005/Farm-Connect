# Authentication

FarmConnect uses a **Login ID**-based authentication system with JWT access/refresh token rotation, OTP email verification, and optional Google OAuth.

---

## 1. Login ID — Primary Identifier

Every FarmConnect account has a **Login ID** — a short alphanumeric identifier generated at registration.

**Format**: `RV` + random 5-digit number → e.g., `RV10241`, `RV82047`

**Why not email?**
- Email addresses appear in data breaches and spam lists. Using a private Login ID as the credential means an attacker who obtains a user's email cannot attempt to log in.
- The Login ID is shown to the user on their profile page and is what they type in the login form.

---

## 2. Registration Flow

```
POST /api/v1/auth/register
Body: { name, email, password, role }
```

1. Server validates email uniqueness and password strength.
2. Server generates a unique Login ID.
3. Password is hashed with bcrypt (12 rounds).
4. `User` document created in MongoDB.
5. OTP sent to email for verification.
6. Response: `{ loginId, message: 'OTP sent to email' }`

---

## 3. Email OTP Verification

```
POST /api/v1/auth/verify-otp
Body: { userId, otp }
```

1. Server looks up `otp:{userId}` key in Redis.
2. Compares submitted OTP with stored value (constant-time comparison).
3. If match: marks `user.isEmailVerified = true`, deletes Redis key.
4. If mismatch: returns 400. After 5 failures, the key is deleted (force re-request).

**OTP properties:**
- 6 digits, cryptographically random (`crypto.randomInt`)
- 5-minute TTL in Redis
- Never stored in MongoDB
- Never written to server logs

**Test bypass**: OTP `123456` is accepted in `NODE_ENV !== 'production'`.

---

## 4. Login Flow

```
POST /api/v1/auth/login
Body: { loginId, password }
```

1. Server finds user by `loginId`.
2. `bcrypt.compare(password, user.passwordHash)`.
3. If valid: issues Access Token (15 min) + Refresh Token (7 days).
4. Both tokens set as `HttpOnly; Secure; SameSite=Strict` cookies.
5. Response body contains safe user profile (no tokens in body).

---

## 5. JWT Token Architecture

### Access Token (15 minutes)

```json
{
  "sub": "userId",
  "role": "CUSTOMER",
  "iat": 1700000000,
  "exp": 1700000900
}
```

- Signed with `JWT_ACCESS_SECRET` using `HS256`.
- Sent on every API request as an `HttpOnly` cookie.
- The `authenticate` middleware verifies this token.

### Refresh Token (7 days)

```json
{
  "sub": "userId",
  "tokenVersion": 3,
  "iat": 1700000000,
  "exp": 1700604800
}
```

- Signed with `JWT_REFRESH_SECRET`.
- When access token expires, client calls `POST /api/v1/auth/refresh`.
- Server validates the refresh token and checks `tokenVersion` matches the database value.
- Issues a new access token (and optionally a new refresh token — token rotation).

### Token Invalidation

To log out all devices:
1. Increment `user.tokenVersion` in MongoDB.
2. All existing refresh tokens now have a stale `tokenVersion` and will be rejected.

---

## 6. Token Verification Middleware

```js
// src/middleware/authMiddleware.js
export const authenticate = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next(new AppError('Not authenticated', 401));

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.sub);
  if (!user) return next(new AppError('User not found', 401));

  req.user = user;
  next();
};
```

Protected routes apply this middleware first, then `authorizeRoles(...)` for RBAC.

---

## 7. Logout

```
POST /api/v1/auth/logout
```

1. Clears `accessToken` and `refreshToken` cookies.
2. Optionally increments `tokenVersion` for full device logout.

---

## 8. Google OAuth (Planned)

The login page includes a Google OAuth button. The planned flow:

1. Client redirects to `GET /api/v1/auth/google`.
2. Server initiates Google OAuth2 flow via `passport-google-oauth20`.
3. On callback, server upserts user record with `googleId`.
4. If new user: generates Login ID, sets `isEmailVerified = true` (Google already verified).
5. Issues JWT cookies, redirects to dashboard.

> **Note**: Google OAuth is shown in the UI but the backend controller is a stub pending OAuth credentials. The Login ID flow is fully functional.

---

## 9. Password Reset Flow (Planned)

```
POST /api/v1/auth/forgot-password   { email }
POST /api/v1/auth/reset-password    { token, newPassword }
```

1. Server generates a secure random reset token.
2. Stores `sha256(token)` in Redis with 1-hour TTL.
3. Sends reset link to email.
4. On reset: validates token, hashes new password, clears all sessions by incrementing `tokenVersion`.

---

## 10. Security Considerations

| Concern | Mitigation |
|---|---|
| Brute force login | `authLimiter`: 10 requests / 15 min per IP |
| OTP flooding | `otpLimiter`: 5 requests / 15 min per IP |
| XSS token theft | `HttpOnly` cookies — tokens never in JS-accessible storage |
| CSRF | `SameSite=Strict` cookies — cross-site requests cannot send cookies |
| Token theft | Short 15-min access token lifetime limits exposure window |
| Session hijacking | `tokenVersion` increment invalidates all sessions instantly |
