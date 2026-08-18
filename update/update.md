# Update Report — Security, Vulnerabilities & Errors

Reviewed: `server/` (Express + Prisma) and `client/` (React + Vite), Aug 2026.

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

## 🔴 Security Vulnerabilities

### 1. Committed secrets in `.env` (no `.gitignore`)
- `server/.env` is checked into the repo with a **real Neon PostgreSQL connection string** (contains DB username + password) and JWT secrets. `client/.env` is also present. There is **no `.gitignore` anywhere**, so `node_modules/`, `dist/`, and `.env` can all be committed.
- Impact: anyone with repo access controls the database and can forge tokens.
- Fix: add `.gitignore` (`node_modules/`, `dist/`, `.env`, `.env.*.local`), rotate the leaked DB credentials and JWT secrets, stop tracking `.env`.

### 2. Fallback JWT secrets in code
- `server/src/config/env.js:9-10` fall back to `fallback_access_secret_123` / `fallback_refresh_secret_123` when env vars are missing.
- Impact: if `.env` is absent the server signs tokens with a predictable public secret → full account takeover and privilege escalation.
- Fix: crash on startup if secrets are missing (`throw` instead of fallback).

### 3. Privilege escalation via public registration
- `server/src/controllers/authController.js:10` — `registerSchema` allows the client to pass `role`, and `/auth/register` is **public** (`authRoutes.js:7`).
- Impact: anyone can register as `MANAGER` and get full admin access.
- Fix: force `role: 'STUDENT'` on registration (or verify via an invite code); never trust role from the client.

### 4. No rate limiting / brute-force protection
- `login`, `register`, and `refresh` have no rate limiting, lockout, or captcha.
- Impact: password brute-force and credential-stuffing attacks.
- Fix: add `express-rate-limit` on auth routes + account lockout after N failures.

## 🟠 High

### 5. Access token in `localStorage`
- `client/src/lib/axios.js` reads/writes `canteen_access_token` from `localStorage`.
- Impact: any XSS steals a valid token (15 min) with full user privileges; refresh also accepted from `req.body` (`authController.js:194`), which defeats the httpOnly cookie protection.
- Fix: move access token to an in-memory store or `sessionStorage`; drop the `req.body.refreshToken` fallback.

### 6. Dependency vulnerabilities (`npm audit`)
- **Server** (3 high, all in the `prisma` CLI dev chain): `deepmerge-ts <8.0.0` stack-exhaustion DoS via `@prisma/config` (GHSA-ggr8-5vv4-36mx). Dev/CLI-only impact, but `fixAvailable: true`.
- **Client** (2 moderate, direct): `react-router-dom` 6.x — open redirect via backslash in `<Link>`/`useNavigate` (CVE-2025-68470) and constructor injection in SSR hydration (GHSA-337j-9hxr-rhxg; not exploitable here — this is a SPA, no SSR). Fix requires the semver-major bump to `react-router-dom@7.18.2`.

### 7. Internal error details leaked to clients
- `server/src/middleware/auth.js:58` returns `error.message` from token verification; `middleware/errorHandler.js:12` returns the full stack trace whenever `NODE_ENV !== 'production'`.
- Impact: helps attackers map internals (library versions, DB errors).
- Fix: log server-side, return generic messages; never send stack traces.

### 8. Weak password policy
- Min 6 characters (`authController.js:9`), no complexity, no lockout.
- Fix: enforce length/complexity and rate-limited attempts.

## 🟡 Medium

### 9. Unrestricted image URLs
- Profile `avatarUrl` (`userController.js:93`) and menu `imageUrl` accept any URL string, rendered in `<img src>` (`UserManagementPage.jsx:120`).
- Impact: external tracking/pixel injection, phishing-style content; no SSRF (client-side render only). Restrict to `/uploads/` paths or the app origin.

### 10. No CSRF hardening on auth cookies
- Refresh cookie uses `sameSite: 'lax'` (not `strict`) and no explicit `path`. Combined with cookie+body token fallback (#5), cross-site requests are possible (read-back blocked by CORS, so low impact).
- Fix: `sameSite: 'strict'`, explicit `path: '/'`.

### 11. Weak/unpredictable order numbers
- `orderController.js:70` generates a random 6-digit `ORD-XXXXXX` — prone to collision against a unique constraint (rare 500s) and guessable order numbers.
- Fix: use a DB sequence, counter, or UUID suffix.

### 12. Analytics uses current price, not historical price
- `reportController.js:101,108` computes revenue with `mi.price` (current) instead of `priceAtOrder`.
- Impact: revenue/category reports wrong after price changes.

## 🔵 Low / Bugs

### 13. `updateStock` lacks validation and has coercion bug
- `menuController.js:194-199` — `Number(stockQuantity)` accepts `NaN`/negatives; `Boolean('false') === true` so a string `"false"` enables items instead of disabling.
- Fix: validate with zod and compare `isAvailable === true`.

### 14. `createOrder` masks 500 errors as 400
- `orderController.js:115` returns `status(400)` for every non-zod error, hiding genuine server failures (e.g. Prisma errors).
- Fix: separate expected business errors from `next(error)`.

### 15. Expired refresh tokens never cleaned up
- Tokens past `expiresAt` stay in the `refresh_tokens` table until the user logs in again.
- Fix: periodic cleanup job.

### 16. No pagination
- `getAllOrders`, `getAllUsers`, `getMenu` return unbounded result sets — performance issue as data grows.

## ✅ Already in place (positive notes)
- Helmet enabled, CORS restricted to known origins.
- Auth middleware reloads user from DB (role from DB, not token) and blocks deactivated accounts.
- Password hashing with bcrypt (10 rounds); token rotation on refresh; stock ops wrapped in transactions; Zod validation on most inputs; Multer image type + 5MB limits.

## Recommended priority
1. #1–#3 (secrets, fallback secrets, role escalation) — do immediately.
2. #4–#6 (rate limit, token storage, `npm audit` fixes).
3. #7–#12 — next iteration.
4. #13–#16 — backlog.