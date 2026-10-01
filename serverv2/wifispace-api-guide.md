# WifiSpace — Frontend Integration Guide

## 1. What this system is

WifiSpace is an ISP billing and provisioning platform for a company that sells two kinds of internet access:

- **PPPoE** — home/office customers with a router physically installed by WifiSpace. They log in, subscribe to a plan, and get billed recurring.
- **Hotspot** — walk-up public wifi customers (street locations). They connect to a wifi network, get redirected to a captive portal page, pick a plan (e.g. "1 day", "7 days"), pay, and get online — usually without ever "signing up" in a traditional sense.

Both service types share the same backend concepts (accounts, plans, subscriptions, payments) but have different customer journeys, described in Section 6.

There are three kinds of people using the system:
- **Customers** — PPPoE or hotspot users, self-service only.
- **Staff / Admin** — WifiSpace employees managing accounts, approving PPPoE installs, handling support, viewing revenue.
- **Superadmin** — full control, including role changes, router management, and impersonation.

---

## 2. General API conventions

**Base URL:** `/api` (all endpoints below are relative to this, e.g. `/api/auth/login`)

**Auth:** JWT-based. On login/verify, you get an `accessToken` (15 min) and `refreshToken` (7 days). Both are also set as `httpOnly` cookies automatically — for a web app, the cookies are set by default, so you mostly don't need to manually store/attach tokens, but the same tokens are returned in the response body for cases where cookies don't apply (e.g. a hotspot flow before login, or non-browser clients).

Send `Authorization: Bearer <accessToken>` on every authenticated request unless you're relying purely on cookies.

**Every response has the same envelope:**

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Human-readable message",
  "data": { }
}
```

**Paginated list responses add a `meta` block:**

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Accounts fetched successfully",
  "data": [ { }, { } ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Errors always look like this** (HTTP status code matches the situation — 400, 401, 403, 404, 409, 429, 500):

```json
{
  "success": false,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid credentials",
  "details": null
}
```

Build your error handling off `code`, not `message` — messages may change wording, codes won't. Common codes you'll see across modules: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `TOO_MANY_REQUESTS`. Module-specific codes are listed per module below where relevant.

**Roles:** `customer`, `staff`, `superadmin`. Most modules split into self-service routes (e.g. `/api/accounts/me`) and admin routes (e.g. `/api/accounts/admin`), gated by role.

---

## 3. Module map

| Module | Base path | Who uses it |
|---|---|---|
| Auth | `/api/auth` | Everyone |
| User | `/api/users` | Everyone (self) + staff (admin) |
| Account | `/api/accounts` | Customers (self) + staff |
| Plan | `/api/plans` | Public (browse) + staff (manage) |
| Subscription | `/api/subscriptions` | Customers (self) + staff |
| Payment | `/api/payments` | Customers (self) + staff + payment gateway webhooks |
| Hotspot | `/api/hotspot` | Public — captive portal only, no login required |
| Router | `/api/routers` | Staff/superadmin only |
| Notifications | `/api/notifications` | Everyone (self) + staff (broadcast) |
| Audit | `/api/audit` | Everyone (own logs) + staff (all logs) |
| Dashboard | `/api/dashboard` | Staff / superadmin |
| Usage | `/api/usage` | Customers (self) + staff |

---

## 4. Auth module — full detail

### `POST /api/auth/register`
Body: `{ firstName, lastName, email, password, phone? }`
→ Creates account, sends an OTP email. Returns:
```json
{
  "id": "…", "email": "…", "firstName": "…", "lastName": "…",
  "role": "customer", "isVerified": false,
  "verificationSent": true, "otpExpiresAt": "2026-…", "mailError": null
}
```

### `POST /api/auth/verify-otp`
Body: `{ email, otp }`
→ On success, logs the user in immediately:
```json
{
  "user": { "id", "firstName", "lastName", "email", "role", "isVerified": true, "avatar", "phone", "theme", … },
  "accessToken": "…",
  "refreshToken": "…"
}
```

### `POST /api/auth/login`
Body: `{ email, password }`
→ Same shape as verify-otp above. If the account isn't verified yet, you'll get a `403 ACCOUNT_NOT_VERIFIED` error instead — redirect to the OTP screen.

### `POST /api/auth/resend-otp`
Body: `{ email }` → `{ message, otpExpiresAt, nextResendAt }`. There's a 60-second cooldown (`RESEND_COOLDOWN_ACTIVE` if you call too soon) — disable the resend button and show a countdown using `nextResendAt`.

### `POST /api/auth/forgot-password`
Body: `{ email }` → always returns a generic success message (doesn't reveal whether the email exists).

### `POST /api/auth/reset-password`
Body: `{ email, otp, newPassword }` → `{ message }`

### `POST /api/auth/refresh`
No body needed if using cookies; otherwise `{ refreshToken }` → new `{ accessToken, refreshToken }`.

### `POST /api/auth/logout`
Requires auth. No body. → `{ message }`

---

## 5. User module — full response shapes (as requested)

### `GET /api/users/me`
```json
{
  "id": "665f...", "firstName": "Ada", "lastName": "Obi",
  "email": "ada@example.com", "phone": "080...",
  "avatar": { "url": "https://…", "publicId": "avatars/..." },
  "role": "customer", "status": "active", "isVerified": true,
  "nin": "***-***-1234",
  "address": "12 Marina Rd", "dateOfBirth": "1994-02-01",
  "gender": "female", "theme": "system",
  "lastLoginAt": "2026-09-20T…", "createdAt": "…", "updatedAt": "…"
}
```
Note `nin` is masked unless the requester is looking at their own profile with explicit consent flows — treat it as display-only, never editable back verbatim.

### `PATCH /api/users/me`
Body: any subset of `{ firstName, lastName, phone, address, gender, dateOfBirth, nin, theme }` → returns the updated user object (same shape as above).

### `PATCH /api/users/me/password`
Body: `{ oldPassword, newPassword }` → `{ message }`

### `POST /api/users/me/avatar`
`multipart/form-data`, field name `file` → `{ id, avatar: { url, publicId }, … }` (full user object)

**Admin (`/api/users/admin`, staff only):**

- `GET /` → paginated user list. Query: `status, role, search, sort (az|za|newest|oldest), page, limit`
- `POST /` → create user. Body: `{ firstName, lastName, email, password, role?, phone? }`
- `GET /:id` → single user
- `PATCH /:id` → admin-edit profile
- `PATCH /:id/role` → superadmin only. Body: `{ role }`
- `PATCH /:id/ban` → Body: `{ reason? }`
- `PATCH /:id/unban`
- `DELETE /:id` → currently a hard delete (will move to soft delete later — don't rely on the user existing after this)
- `PATCH /:id/password` → admin sets a new password. Body: `{ newPassword }`
- `POST /:id/impersonate` → superadmin only. Returns `{ accessToken, impersonating: {...user} }` — a short-lived token to act as that user. Show a clear "You are viewing as X" banner whenever this token is in use.

---

## 6. Other modules — condensed shapes

### Account (`/api/accounts`)
An **account** is a customer's service subscription container — one per PPPoE line or hotspot identity. A user can have multiple accounts (e.g. one PPPoE at home + a hotspot identity).

```json
{
  "id": "…", "userId": "…", "wsnId": "WSN0042",
  "serviceType": "pppoe", "accountType": "personal",
  "status": "active", "approvalStatus": "approved",
  "routerProfile": "10mbps-profile",
  "createdAt": "…"
}
```
Hotspot accounts additionally carry `maxDevices` and `devices: [{ macAddress, hostname, lastSeenAt }]`. PPPoE accounts never show `routerPassword` in any response.

- `GET /api/accounts/me` → list of the logged-in user's accounts
- `GET /api/accounts/me/:id` → one account (must belong to you)
- `POST /api/accounts/me` → request a new account. Body: `{ serviceType, accountType?, businessName? }` — `businessName` only applies to PPPoE.
- `POST /api/accounts/me/:id/devices` (hotspot only) → Body: `{ macAddress, hostname? }`
- Admin routes handle approve/reject/suspend/pause/resume/terminate/transfer — all staff-only, all return the updated account.

### Plan (`/api/plans`)
Public, no auth needed for browsing.

```json
{
  "id": "…", "name": "7-Day Unlimited", "serviceType": "hotspot",
  "price": 1500, "speedRate": "5Mbps",
  "durationValue": 7, "durationUnit": "days",
  "dataLimitBytes": 0,
  "devicesAllowed": 2, "features": ["No time restriction"],
  "status": "active"
}
```
`dataLimitBytes: 0` means unlimited data. Use `GET /api/plans?serviceType=hotspot` to filter the catalog shown on the captive portal or the PPPoE plan-picker.

### Subscription (`/api/subscriptions`)
```json
{
  "id": "…", "accountId": "…", "status": "active",
  "planSnapshot": { "name": "7-Day Unlimited", "price": 1500, "durationValue": 7, "durationUnit": "days" },
  "expiresAt": "2026-10-05T…", "graceEndsAt": null,
  "cycles": 1, "bonusDays": 0
}
```
`GET /api/subscriptions/me` → all of the logged-in user's subscriptions (current + history).

### Payment (`/api/payments`)
```json
{
  "id": "…", "amount": { "total": 1500, "base": 1500, "discount": 0 },
  "status": "successful", "gateway": "paystack",
  "gatewayReference": "WSN-…", "processedAt": "…"
}
```
- `POST /api/payments` → Body: `{ accountId, planId, cycles?, callbackUrl }`. **`callbackUrl` must be the page the customer should land back on after paying** — set it to your own checkout/success page URL, don't hardcode a backend URL. Response includes `authorizationUrl` — redirect the browser there.
- `GET /api/payments/verify/:reference` → poll this after redirect-back to confirm status: `pending | successful | failed`.

### Hotspot (`/api/hotspot`) — no auth, public captive-portal endpoints
See Section 7 for the full flow. Key endpoints:
- `GET /api/hotspot/session?macAddress=...&identity=...` → tells you what screen to show (see below)
- `GET /api/hotspot/plans` → hotspot-only plan catalog
- `POST /api/hotspot/start` → begins checkout for a new or returning customer
- `POST /api/hotspot/login` → existing customer logging in on a new/untrusted device
- `GET /api/hotspot/status?reference=...&macAddress=...` → poll this after payment redirect to know when internet is actually live

### Notifications (`/api/notifications`)
`GET /api/notifications/me` → paginated list of the user's notifications, each with a `status` (`PENDING|SENT|DELIVERED|READ|FAILED`). `PATCH /api/notifications/me/:id/read` marks one read.

### Usage (`/api/usage/accounts/:accountId/me`)
```json
{
  "totalBytesUsed": 204800000, "totalSecondsUsed": 3600,
  "remainingBytes": null, "remainingSeconds": 82400,
  "dataUsagePercent": 0, "lastSyncedAt": "…"
}
```
`remainingBytes: null` means unlimited data on that plan — show "Unlimited" rather than a number/progress bar in that case.

### Dashboard (`/api/dashboard`) — staff/superadmin
`GET /api/dashboard/staff` → operational counts (accounts, active subscriptions, pending approvals). `GET /api/dashboard/admin` (superadmin only) → adds `revenue: { total, thisMonth }` and payment counts.

---

## 7. Suggested user experience per flow

### 7.1 PPPoE customer journey (the "I have a router at home" flow)

1. **Sign up** → email/password → OTP verification screen (6-digit input, auto-focus next box, resend button disabled with a live countdown from `nextResendAt`).
2. **Request account** → simple form: "Personal or Business?" If business, show business name/reg number fields (these only apply to PPPoE — don't show them anywhere in the hotspot flow at all).
3. **Pending state** — after requesting, the account sits in `approvalStatus: pending`. Show a clear "Your installation request is being reviewed" card, not a blank/broken-looking dashboard. This is the state before WifiSpace has physically installed a router.
4. **Once approved** → customer picks a plan (`GET /api/plans?serviceType=pppoe`), pays, subscription activates automatically. Show plan cards with price, speed, duration — a simple pricing-table UI works well here.
5. **Ongoing dashboard**: current plan, expiry countdown, usage widget (time-based mainly, data widget only if `dataLimitBytes > 0`), a "Renew" button that reuses the payment flow, and payment history.
6. **Admin pause/maintenance**: if `account.status` is `paused` or `suspended`, show a distinct banner explaining service is temporarily on hold — don't just silently show them a broken/empty state.

**Suggested screens:** Login/Signup → OTP → Account Setup → (Pending Approval interstitial) → Plan Picker → Payment (redirect to Paystack) → Dashboard (Plan card, Usage card, Payment history, Renew CTA, Support link).

### 7.2 Hotspot customer journey (the "I'm at a public wifi spot" flow)

This is the more delicate UX — it needs to feel like a normal captive portal, not a full app.

1. Device connects to the wifi → router redirects the browser to your portal page with query params identifying the router (`identity`/`routerUid`) and the device (you'll need the device's MAC — usually available from the redirect URL RouterOS provides, check the params your router config passes).
2. **Immediately call** `GET /api/hotspot/session` with those params. Branch the UI on the returned `state`:
   - `UNKNOWN_DEVICE` → show plan selection + a simple "enter your email" field (name optional). This is a brand-new or unrecognized device.
   - `TRUSTED_NEEDS_PLAN` → device is recognized (they've paid before) but has no active plan right now — skip straight to plan picker, no email/login needed.
   - `ACTIVE` → they already have working internet — show a "You're connected!" screen, maybe with remaining time/data, and a way to close the tab.
   - `PENDING` → rare transitional state, show a loading state and re-poll.
3. If the flow says login is required (an existing account on an untrusted device), show a lightweight email+password form — call `POST /api/hotspot/login`.
4. Plan selection → `POST /api/hotspot/start` with `callbackUrl` set to this same portal page's URL → redirect to `authorizationUrl` (Paystack).
5. After payment redirect-back, **poll** `GET /api/hotspot/status?reference=...&macAddress=...` every 2-3 seconds for up to ~30 seconds. Once `connected: true`, show "You're online!" and prompt them to close the tab / try browsing.
6. Keep this whole flow to as few taps/fields as possible — this is a phone-in-hand, impatient-customer context, not a desktop signup form. Big plan cards, one-tap payment, minimal typing.

**Suggested screens:** Splash/Loading (resolving session) → Plan Picker (big cards: "1 Hour ₦200", "1 Day ₦500", "7 Days ₦1500") → Email capture (only if unknown device) → Payment redirect → "Connecting…" (polling) → "You're Online" success screen.

### 7.3 Admin/staff dashboard

- **Dashboard home**: the stats from `/api/dashboard/staff` or `/admin` — pending approvals count should be prominent and clickable (deep-links to the approval queue), since that's the actionable item admins check most.
- **Accounts table**: filterable by service type, status, approval status; row actions for approve/reject/suspend/pause/resume, with a confirmation modal for anything destructive (terminate, delete).
- **Approval queue**: a focused view of just `approvalStatus: pending` PPPoE accounts, since that's a distinct workflow from general account management — router assignment happens here (approving requires picking a `routerId`).
- **Subscriptions**: searchable, with quick actions for suspend/cancel/extend/renew — "extend" and "renew" are different, make sure the UI doesn't conflate them (extend = add days for free, renew records a new payment).
- **Payments**: a ledger view, plus a "Record Manual Payment" button (cash/bank transfer) for phone-support or in-person collection — this is a distinct form (account + plan + channel + note), not the same as the customer checkout flow.
- **Routers**: list with online/offline status badges, sync button, reboot (superadmin only, with a strong confirmation since it disconnects live customers).
- **Notifications**: a broadcast composer (title, message, audience, channel) for admin-initiated messages.
- Show role-gated UI, not just role-gated API calls — hide buttons for actions a `staff` user can't perform (role changes, impersonation, router create/delete, revenue figures) rather than showing them and letting the API 403.

---

## 8. A few integration notes worth knowing up front

- **Idempotency on payment init**: each `POST /api/payments` call creates a new payment attempt — don't call it repeatedly on button re-clicks; disable the button on submit and wait for the redirect.
- **Webhooks are the real source of truth** for payment success, not your frontend polling alone — polling is just for UX responsiveness; if a customer closes the tab mid-payment, the subscription still activates correctly server-side once the gateway webhook lands.
- **Masked fields** (`nin`) come back masked by default from most endpoints — don't build a form that round-trips the masked value back as if it were real data.
- **Timestamps** are ISO 8601 strings in UTC — convert to local time for display.
- **File uploads** (avatar) are `multipart/form-data`, not JSON.

If anything here doesn't match what you see in practice once you start integrating, flag it — this document reflects the backend as currently built, and some pieces (analytics, agent tooling, customer service ticketing) are still planned but not yet implemented.
