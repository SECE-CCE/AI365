# AI365 @ CCE — Formal Security Architecture & Threat Model

This document outlines the security architecture, controls, threat model, and defense mechanisms implemented across the **AI365 @ CCE** application.

---

## 🛡️ 1. Core Security Architecture & Requirements

### 1.1 Authentication & Session Management
- **Stateless Verification via JSON Web Tokens (JWT)**: Authentication utilizes JWT tokens signed with a 64-character server-side `JWT_SECRET`.
- **HttpOnly Cookie Storage**: Tokens are delivered via secure `HttpOnly` cookies (`res.cookie('token', ...)`). Client-side JavaScript cannot read `document.cookie` or access tokens via `localStorage`, eliminating token exfiltration through Cross-Site Scripting (XSS).
- **Enforced Session Expiration**:
  - JWT tokens are issued with a strict 1-hour expiration period (`SESSION_EXPIRES_IN=1h`).
  - Backend `authMiddleware` validates token expiration on every request and responds with `401 Unauthorized` (`SESSION_EXPIRED`) if expired.
  - Client-side `AuthContext` runs a 60-minute inactivity timer and catches 401 HTTP responses to cleanly logout users and redirect to `/login?session_expired=true`.

### 1.2 Authorization & Access Control (RBAC)
- **Role-Based Guards**: Route endpoints are protected by `roleGuard(['student' | 'faculty' | 'admin'])`.
- **Department-Wide & Mentorship Scoping**:
  - Students can only view and submit their own learning activities.
  - Faculty members can only review/approve submissions belonging to their assigned mentees unless granted `is_department_wide = true`.
  - Administrators maintain department-wide governance permissions.
- **Anti-Self-Approval**: Students cannot approve their own submissions or alter the status of entries once reviewed.

### 1.3 Input Validation & Data Sanitization
- **Server-Side Validation**: All student endpoints (`api/students/*`) and event endpoints (`api/events/*`) validate input types, numeric ranges (`hours` between 0.1 and 24), string lengths, date formats, and URL strings prior to database operations.
- **Duplicate Submission Detection**: The system checks for duplicate activity submissions per student to prevent spamming or point inflation.

### 1.4 SQL Injection (SQLi) Defense
- **Parameterized SQL Queries**: All database queries interact with Neon PostgreSQL via parameterized place-holders (`$1`, `$2`, or template literal tag `sql`...``).
- **Explicit Column Allowlisting**: Dynamic SQL updates (`db.updateUser`) enforce an explicit column allowlist (`ALLOWED_USER_COLUMNS`) filtering out any unapproved field names before constructing dynamic SQL `SET` clauses.

### 1.5 Rate Limiting & Denial of Service (DoS) Protection
- **Authentication Limiter**: `/api/auth/login` and `/api/auth/register` endpoints are governed by `express-rate-limit` (15 requests per 15-minute window per IP).

### 1.6 Persistent Security Activity Logging
- **Immutable Auth Audit Trail**: Authentication events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`) are persistently logged in the PostgreSQL `auth_logs` table along with IP addresses, user-agent strings, failure reasons, and calculated session durations.
- **Credential Privacy**: Sensitive data (passwords, plaintext keys, JWT tokens) are strictly excluded from log entries.
- **Restricted Access**: Auth logs are accessible only to authenticated admins via `/api/admin/auth-logs`.

---

## 🎯 2. STRIDE Threat Model Matrix

| Threat Category | Potential Risk | Mitigation / Countermeasure |
| :--- | :--- | :--- |
| **Spoofing** | Attacker impersonates an admin or student user | Cryptographically signed JWT tokens, bcrypt hashed passwords (cost 10), HttpOnly cookie delivery |
| **Tampering** | Student alters approved points or injects SQL payload into `updateUser` | Parameterized queries, explicit column allowlists, server-side status lock on approved records |
| **Repudiation** | User denies logging in or performing actions | Persistent PostgreSQL audit logging (`auth_logs` & `activity_logs`) recording IP, timestamp, user-agent |
| **Information Disclosure** | Sensitive JWT secret or passwords committed to Git | Mandatory `.env` variable enforcement, `.gitignore` configuration, `.env.example` template |
| **Denial of Service** | Brute-force password guessing attacks on auth endpoints | IP-based rate limiting (`authLimiter`), session inactivity timeouts |
| **Elevation of Privilege** | Student calls admin routes (`/api/admin/*`) or approves own items | Express `roleGuard(['admin'])` middleware, server-side role check |

---

## 🚀 3. Secure Deployment Guidelines

1. Set strong `JWT_SECRET` (minimum 64 random characters) in production environment secrets.
2. Ensure `NODE_ENV=production` so cookies enforce `secure: true` over HTTPS.
3. Keep `.env` strictly excluded from git repository.
4. Run regular automated security test suites (`npm run test:security`).
