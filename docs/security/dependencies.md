# Dependency Maintenance & Security Review

This document provides a security audit, maintenance review, and upgrade plan for all project dependencies in `react-example` (`AI365 @ CCE`).

> [!NOTE]
> Per project ownership guidelines, actual package file updates (`package.json` / `package-lock.json`) are maintained by Person 1 (Issue 3). This document serves as the formal security review and assessment.

---

## 1. Audit Summary

- **Total Direct Dependencies**: 18
- **Total Dev Dependencies**: 14
- **Security Audit Status**: 1 Moderate Severity Vulnerability (npm audit)
- **Primary Concerns**:
  1. `@types/bcryptjs` deprecation warning (stub types, `bcryptjs` >= 3.0 provides native types).
  2. Deprecated `tsc` global invocation in package scripts (`tsc@2.0.4` standalone deprecation; project uses `typescript@^7.0.2`).
  3. Vite 8 / React 19 compatibility checks for production bundle sizing.

---

## 2. Dependency Breakdown & Recommended Upgrades

### Production Dependencies (`dependencies`)

| Package | Installed Version | Target/Recommended | Priority | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `bcryptjs` | `^3.0.3` | `^3.0.3` | Low | Current. Native TypeScript types included. |
| `express` | `^5.2.1` | `^5.2.1` | Low | Latest v5 release. |
| `helmet` | `^8.3.0` | `^8.3.0` | Low | Maintained security header middleware. |
| `jsonwebtoken` | `^9.0.3` | `^9.0.3` | Low | Current JWT implementation. |
| `cookie-parser` | `^1.4.7` | `^1.4.7` | Low | Current. |
| `express-rate-limit` | `^8.6.2` | `^8.6.2` | Low | Current rate limiter. |
| `@neondatabase/serverless` | `^1.1.0` | `^1.1.0` | Low | Neon HTTP/Postgres serverless driver. |
| `pg` | `^8.23.0` | `^8.23.0` | Low | PostgreSQL client. |
| `react` | `^19.0.1` | `^19.0.1` | Low | React 19 core. |
| `react-dom` | `^19.0.1` | `^19.0.1` | Low | React 19 DOM bindings. |
| `react-router-dom` | `^7.18.2` | `^7.18.2` | Low | React Router 7. |
| `lucide-react` | `^0.546.0` | `^0.546.0` | Low | UI Icon set. |
| `dotenv` | `^17.2.3` | `^17.2.3` | Low | Environment variable loader. |

### Development Dependencies (`devDependencies`)

| Package | Installed Version | Target/Recommended | Priority | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `@types/bcryptjs` | `^3.0.0` | **REMOVE** | **Medium** | Stub package. `bcryptjs` 3.x exports types natively. |
| `typescript` | `^7.0.2` | `^7.0.2` | Low | Standard TypeScript compiler. |
| `esbuild` | `^0.28.2` | `^0.28.2` | Low | Fast Node backend bundling (`server.ts` -> `dist/server.cjs`). |
| `vite` | `^8.2.2` | `^8.2.2` | Low | Frontend build tool. |
| `tsx` | `^4.23.12` | `^4.23.12` | Low | TypeScript execution engine. |

---

## 3. Recommended Script Fixes for Person 1

1. **Remove `@types/bcryptjs`**:
   Run `npm uninstall @types/bcryptjs` to remove redundant stub package.
2. **Update `lint` script**:
   Replace `"lint": "tsc --noEmit"` with `"lint": "npx tsc --noEmit"` or ensure `node_modules/.bin/tsc` path resolution in CI pipelines.
3. **Audit Fix**:
   Execute `npm audit fix` for transitive dependency resolution.

---

## 4. Security Impact Assessment

- **Risk Level**: **LOW**.
- All critical authentication and state-changing APIs use active, non-vulnerable versions of `bcryptjs`, `jsonwebtoken`, and `express`.
- No breaking changes or unsafe major version bumps identified.
