# 📝 Project Changes Log

This log lists all dependency updates, TypeScript fixes, and server configurations applied during the maintenance cycle.

---

### 📦 1. Dependency Upgrades & Version Alignment

1. **Production Dependency Upgrades**
   * **Action**: Updated key core packages to their latest stable compatible versions in [`package.json`](file:///c:/Users/varun/.A.Varun_data/AI365/package.json).
   * **Packages Updated**: `express` (`^5.2.1`), `vite` (`^8.2.2`), `@vitejs/plugin-react` (`^6.1.0`), `@google/genai` (`^2.18.0`), `motion` (`^13.1.1`), and `pg` (`^8.23.0`).

2. **Development & Type Definitions Upgrades**
   * **Action**: Bumped development dependencies and type files to match standard version rules in [`package.json`](file:///c:/Users/varun/.A.Varun_data/AI365/package.json).
   * **Packages Updated**: `typescript` (`^7.0.2`), `esbuild` (`^0.28.2`), `tsx` (`^4.23.12`), `@types/node` (`^26.3.0`), `@types/express` (`^5.0.6`), `@types/pg` (`^8.23.1`), and `@types/react-dom` (`^19.2.5`).

3. **Lucide React Version Lock (Pinning)**
   * **Action**: Explicitly pinned `lucide-react` to version `^0.546.0` inside [`package.json`](file:///c:/Users/varun/.A.Varun_data/AI365/package.json).
   * **Rationale**: Newer `lucide-react` `1.x` major releases remove brand/corporate logos (such as `Github`). Since the student workspace dashboards require the GitHub icon, keeping `0.546.0` preserves required UI symbols.

4. **Removal of Unused Dependencies**
   * **Action**: Scanned and purged unused packages to streamline the project's weight and compile times.
   * **Removed from Disk**: `@google/genai`, `canvas-confetti`, `clsx`, `motion`, `tailwind-merge`, `@types/canvas-confetti`, `autoprefixer`, and `tailwindcss` (removed 51 nested packages during `npm install` pruning).

---

### 🛠️ 2. TypeScript & Code Compilation Fixes

5. **CSS Stylesheet Import Support**
   * **File Modified**: [`src/assets.d.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/src/assets.d.ts)
   * **Fix**: Added a `declare module '*.css';` module declaration so that side-effect global styling imports (`import './index.css'`) compile correctly under TypeScript v7.

6. **Sorting Callback Parameters Typings**
   * **File Modified**: [`api/_db/client.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/api/_db/client.ts)
   * **Fix**: Added explicit `NotificationRow` type annotations to the sort callback parameters `(a: NotificationRow, b: NotificationRow)` inside the in-memory database notifications fetch layer, satisfying stricter type rules.

7. **Blob / Buffer Type Mismatch Fix**
   * **File Modified**: [`api/_services/drive.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/api/_services/drive.ts)
   * **Fix**: Wrapped standard Node.js `Buffer` objects in a `Uint8Array` view before sending them to the `Blob` constructor inside the Google Drive file uploader, preventing assignments conflict errors with `BlobPart`.

---

### 🐛 3. Express v5 Runtime Crash & Path Resolution Fixes

8. **Catch-All Wildcard Parameter Naming**
   * **File Modified**: [`server.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/server.ts)
   * **Fix**: Express v5 uses a stricter path parser (`path-to-regexp` v8) which fails when using plain wildcard symbols `*`. Replaced all plain catch-all wildcards with named wildcard parameters:
     ```typescript
     // Dev server fallbacks:
     app.use('/*splat', async (req, res, next) => { ... })
     
     // Prod build fallbacks:
     app.get('/*splat', (req, res) => { ... })
     ```

9. **Safe `res.sendFile` Windows Path Resolution**
   * **Files Modified**: [`server.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/server.ts)
   * **Fix**: Express 5 on Windows has issues resolving raw absolute backslash-joined paths inside the `send` module. Refactored index routing and document middleware to use the cross-platform `{ root }` configuration parameter in `res.sendFile()` (e.g. `res.sendFile('index.html', { root: distPath })`), preventing `NotFoundError` startup crashes.

10. **Development Mode Environment Force Lock**
    * **File Modified**: [`nodemon.json`](file:///c:/Users/varun/.A.Varun_data/AI365/nodemon.json)
    * **Fix**: Added `"env": { "NODE_ENV": "development" }` configuration. This forces nodemon development starts into development mode instead of mistakenly resolving to production mode if a compiled build (`dist/index.html`) is left on disk.

11. **Vite ESModule Config Warning Fix**
    * **File Modified**: [`vite.config.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/vite.config.ts)
    * **Fix**: Replaced the deprecated Node.js `__dirname` keyword with modern ESM `import.meta.dirname` syntax inside path resolutions, removing configLoader compilation warnings.

---

### 🔒 4. Secure Coding & Environment Isolation

12. **Environment-Driven Admin Credentials**
    * **Files Modified**: [`seed_admin.mjs`](file:///c:/Users/varun/.A.Varun_data/AI365/seed_admin.mjs), [`reset_db.mjs`](file:///c:/Users/varun/.A.Varun_data/AI365/reset_db.mjs), [`api/_db/client.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/api/_db/client.ts), and [`.env`](file:///c:/Users/varun/.A.Varun_data/AI365/.env)
    * **Fix**: Moved all default administrator login credentials (names, email addresses, and passwords) out of hardcoded file strings and bound them to environment variables (`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`), allowing full external configuration.

---

### 📦 5. Database Schema Synchronizations & Restoration Safeguards

13. **Idempotent Migration Sync for Missing Tables**
    * **File Modified**: [`migrate_db.mjs`](file:///c:/Users/varun/.A.Varun_data/AI365/migrate_db.mjs)
    * **Fix**: Appended schemas for `roadmap`, `gallery`, and `announcements` to the migration runner to ensure parity with the primary `db/schema.sql` model and prevent relation-not-found errors during raw database bootstrap.

14. **Learning Hours Column Fix**
    * **File Modified**: [`migrate_db.mjs`](file:///c:/Users/varun/.A.Varun_data/AI365/migrate_db.mjs)
    * **Fix**: Added the missing `updated_at` column definitions and alter rules for the `learning_hours` table schema, ensuring data dumps with timestamp fields are correctly written during recovery.

15. **Auto-Migration Restoration Guard**
    * **File Modified**: [`restore_db.mjs`](file:///c:/Users/varun/.A.Varun_data/AI365/restore_db.mjs)
    * **Fix**: Added a synchronous check that automatically runs database migrations (`node migrate_db.mjs`) before starting any table wipes, safeguarding restoration operations against uninitialized database environments.

---

### 💾 6. Real-Time Backup Synchronizations (Approval Gated)

16. **Gated Real-time User Database Sync**
    * **File Modified**: [`api/_db/client.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/api/_db/client.ts)
    * **Fix**: Integrated a disk synchronization trigger (`syncRegisteredUsers`) inside user database mutations, which filters and writes only user profiles that have been authorized and verified by the admin (`status === 'approved'`) to the local JSON backup file.

17. **Gated Uploads Backup on Admin Approval**
    * **Files Modified**: [`api/upload/index.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/api/upload/index.ts) and [`api/admin/index.ts`](file:///c:/Users/varun/.A.Varun_data/AI365/api/admin/index.ts)
    * **Fix**: Reverted default copy-on-upload logic and moved the copying hook to the administrator's approvals and user registration endpoints. File copies are now created inside `backups/uploads/` only after the admin reviews and approves the submission.

---

### 🛡️ 7. Git Version Control Exclusions

18. **Backups Directory Ignore Rules**
    * **File Modified**: [`.gitignore`](file:///c:/Users/varun/.A.Varun_data/AI365/.gitignore)
    * **Fix**: Added `backups/` to the ignore rules to prevent sensitive real-time database payloads and user documents from leaking to public or shared Git repositories.

---

### 🧪 8. Testing & Verification

19. **Build Checks and Integrity Verification**
    * **Action**: Executed compilation sanity runs to ensure all components integrate cleanly.
    * **Status**: Both `npm run lint` (TS validation) and `npm run build` (production Vite bundling and Node.js esbuild server bundling) compiled successfully with **0 errors**.
