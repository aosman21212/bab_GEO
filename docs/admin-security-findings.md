# Admin security findings

Prioritized issues found in the admin auth / session stack. Fix **one ID at a time** (e.g. ask to implement `#1`, then `#2`).

Status: open = not fixed yet · fixed / mitigated = done.

---

## #1 — High: JWT lasts 7 days while cookie idle is short

**Status:** fixed  

**Files:**
- [`backend/src/middleware/auth.ts`](../backend/src/middleware/auth.ts) — `expiresIn: '20m'`; re-issues via `x-admin-token`
- [`frontend/lib/admin-session.ts`](../frontend/lib/admin-session.ts) — cookie / idle = 20 minutes
- [`frontend/app/api/admin/proxy/[...path]/route.ts`](../frontend/app/api/admin/proxy/[...path]/route.ts) — slides cookie with refreshed JWT

**Fix applied:** JWT lifetime matches the idle window; active requests refresh the token.

---

## #2 — High: Weak default secrets in config fallbacks

**Status:** fixed  

**Files:**
- [`backend/src/config.ts`](../backend/src/config.ts)

**Fix applied:**  
In `NODE_ENV=production`, `JWT_SECRET` and `ADMIN_PASSWORD` are required with **no** insecure fallbacks. Known-weak values (`dev-secret`, `change-me-in-production-bab-cms`, `Admin123!`, short secrets) cause boot failure. Local/dev may still use code fallbacks when env is unset.

---

## #3 — High: No rate limit on admin login

**Status:** fixed  

**Files:**
- [`backend/src/routes/auth.ts`](../backend/src/routes/auth.ts)

**Fix applied:**  
Redis rate limit: **10 attempts / 60s** per IP and per email. Exceeding returns `429 Too many login attempts`.

---

## #4 — Medium: Idle timeout is client-only

**Status:** fixed  

**Files:**
- [`backend/src/middleware/auth.ts`](../backend/src/middleware/auth.ts) — stable JWT `sid`; denylist check in `requireAuth`
- [`backend/src/cache.ts`](../backend/src/cache.ts) — Redis `admin:deny:{sid}`
- [`backend/src/routes/auth.ts`](../backend/src/routes/auth.ts) — `POST /api/auth/logout`
- [`frontend/app/api/admin/logout/route.ts`](../frontend/app/api/admin/logout/route.ts) — forwards token to backend, then clears cookie
- [`frontend/components/admin-session-guard.tsx`](../frontend/components/admin-session-guard.tsx) — hidden-tab time counts toward idle

**Fix applied:**  
Logout and idle denylist the JWT session id in Redis so a copied cookie cannot be reused. Hidden tabs count toward the 20-minute idle window. If Redis is down, JWT/cookie expiry (~20m) remains the fallback.

---

## #5 — Medium: Default admin password documented in the repo

**Status:** fixed  

**Files:**
- [`docker-compose.yml`](../docker-compose.yml) — `JWT_SECRET` / `ADMIN_PASSWORD` **required** from `.env` (no `Admin123!` default)
- [`.env.example`](../.env.example), [`backend/.env.example`](../backend/.env.example) — empty placeholders
- [`README.md`](../README.md), [`backend/README.md`](../backend/README.md), [`docs/configuration-guide.md`](configuration-guide.md) — no shipped default password

**Fix applied:** Compose fails fast if secrets are missing. Docs tell you to set passwords in gitignored `.env` and re-seed.

---

## #6 — Low: Keep login errors non-enumerating

**Status:** ok (maintain)

**Files:**
- [`backend/src/routes/auth.ts`](../backend/src/routes/auth.ts)

**Notes:**  
Invalid email and wrong password both return `Invalid email or password`.

---

## #7 — Info: Login Activity audit trail

**Status:** ok (informational)

**Files:**
- [`backend/src/login-activity.ts`](../backend/src/login-activity.ts)
- Admin → Users → Activity tab

---

## Suggested fix order

1. ~~`#1` JWT / session lifetime~~ **done**
2. ~~`#3` Login rate limiting~~ **done**
3. ~~`#2` Insecure production fallbacks~~ **done**
4. ~~`#5` Documented / compose defaults~~ **done**
5. ~~`#4` Client-only idle~~ **done**

---

## Apply locally (Docker)

Docker backend runs with `NODE_ENV=production`, so weak secrets are rejected and Compose **requires** values from the root `.env` (gitignored — never commit it).

1. In root `.env`, set at least:
   - `JWT_SECRET` — 24+ characters (not a known weak placeholder)
   - `ADMIN_EMAIL` — e.g. `admin@bab.com.sa`
   - `ADMIN_PASSWORD` — 12+ characters (not `Admin123!`)
2. Rebuild and restart:

```powershell
cd "c:\xampp\php\www\New folder (8)"
docker compose up -d --build backend frontend
npm run docker:seed
```

3. Sign in at `http://localhost:3003/admin` with the email/password from `.env`.

**Note:** Changing `ADMIN_PASSWORD` only updates the seeded admin after `npm run docker:seed` (or an equivalent password update). Existing Mongo users keep their old hash until re-seeded or changed in Admin → Users.

### Production checklist

- [ ] Unique strong `JWT_SECRET` (24+)
- [ ] Unique strong `ADMIN_PASSWORD` (12+, not used elsewhere)
- [ ] Root/server `.env` not in git
- [ ] Re-seed or update admin password after first deploy
- [ ] Confirm login rate limit works (Redis up)
- [ ] Confirm idle / JWT ~20m behaviour on live admin
