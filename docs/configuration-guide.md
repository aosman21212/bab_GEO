# BAB GEO — Configuration & Code Change Guide

**Last updated:** September 1, 2026  
**Repo:** https://github.com/aosman21212/bab_GEO.git

This document lists every place you need to change URLs and environment settings for **local Docker**, **local dev**, and **production**.

---

## Quick reference

| Item | Local Docker | Production |
|------|--------------|------------|
| Site URL | `http://localhost:3003` | `https://bab.com.sa` |
| Admin | `http://localhost:3003/admin` | `https://bab.com.sa/admin` |
| API | `http://localhost:4001` | `http://127.0.0.1:4001` (or separate host) |
| Base path | empty (domain root) | empty (domain root) |
| Site origin (env) | `http://localhost:3003` | `https://bab.com.sa` |
| CORS origin | `http://localhost:3003` | `https://bab.com.sa` |
| Admin login | `admin@bab.com.sa` / `Admin123!` | same (change password in prod) |

---

## 1. Environment files (you edit these)

These are the **main files you change** when switching local ↔ production.

### Frontend — local only (not in git)

**File:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_BASE_PATH=
INDEXNOW_KEY=your-key-here
```

| Variable | Local | Production |
|----------|-------|------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3003` | `https://bab.com.sa` |
| `NEXT_PUBLIC_BASE_PATH` | empty | empty |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4001` | `https://api.bab.com.sa` or same host |

> `NEXT_PUBLIC_SITE_URL` is the **origin only** (scheme + host + port). The site runs at domain root.

---

### Frontend — template (committed)

**File:** `frontend/.env.example`

Copy to `frontend/.env.local` and adjust values.

---

### Backend — local only (not in git)

**File:** `backend/.env`

```env
PORT=4001
MONGODB_URI=mongodb://127.0.0.1:27018/bab_cms
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your-secret-here
CORS_ORIGIN=http://localhost:3003
ADMIN_EMAIL=admin@bab.com.sa
ADMIN_PASSWORD=Admin123!
```

| Variable | Local | Production |
|----------|-------|------------|
| `CORS_ORIGIN` | `http://localhost:3003` | `https://bab.com.sa` |
| `JWT_SECRET` | dev value | strong random secret |
| `MONGODB_URI` | `127.0.0.1:27018` (host) | your MongoDB URL |
| `ADMIN_PASSWORD` | `Admin123!` | strong password |

> **Important:** `CORS_ORIGIN` must match the frontend **origin** (scheme + host + port). Use port **3003**, not 3000.

---

### Backend — template (committed)

**File:** `backend/.env.example`

---

### Docker Compose (committed)

**File:** `docker-compose.yml`

| Variable | Default | Used by |
|----------|---------|---------|
| `SITE_URL` | empty | frontend runtime (sitemap, robots, llms — **no rebuild**) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3003` | frontend (build + runtime) |
| `NEXT_PUBLIC_BASE_PATH` | empty | frontend (build + runtime) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4001` | frontend (build) |
| `CORS_ORIGIN` | `http://localhost:3003` | backend |
| Port mapping | `3003:3000` | frontend container |

Override by creating a root `.env` file next to `docker-compose.yml`:

```env
SITE_URL=https://bab.com.sa
NEXT_PUBLIC_SITE_URL=https://bab.com.sa
NEXT_PUBLIC_BASE_PATH=
CORS_ORIGIN=https://bab.com.sa
JWT_SECRET=your-production-secret
ADMIN_PASSWORD=your-strong-password
```

> `SITE_URL` fixes sitemap/robots/llms immediately on `docker compose up -d` (no rebuild). Rebuild frontend if you also need `NEXT_PUBLIC_SITE_URL` in client bundles.

After changing Docker env vars:

```bash
docker compose build frontend
docker compose up -d
```

---

### Frontend Dockerfile (build-time)

**File:** `frontend/Dockerfile` (lines 12–18)

```dockerfile
ARG NEXT_PUBLIC_API_URL=http://localhost:4001
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3003
ARG NEXT_PUBLIC_BASE_PATH=
```

These are baked into the image at **build time**. Rebuild after changes.

---

## 2. Core code files (base path logic)

Change these only if you need a subpath deployment (e.g. `/subdir`).

### Base path helper

**File:** `frontend/lib/base-path.ts`

```ts
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')

export function withBasePath(path: string) { ... }
export function withBasePathIfInternal(src: string) { ... }
```

- Used by admin API calls, images, preview links, cookies
- Default: empty (domain root)

---

### Next.js config

**File:** `frontend/next.config.mjs`

```js
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')

const nextConfig = {
  basePath,
  async redirects() {
    return [
      ...(basePath
        ? [{ source: '/', destination: basePath, permanent: false, basePath: false }]
        : []),
      { source: '/ar/admin', destination: '/admin', permanent: false },
      // ...
    ]
  },
}
```

- Sets Next.js `basePath` (empty by default)
- Redirects `/ar/admin` → `/admin`

---

### Site URL for SEO / GEO

**File:** `frontend/lib/geo-content.ts`

```ts
export function getSiteUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://bab.com.sa'
  const origin = raw.replace(/\/$/, '')
  if (!basePath) return origin
  return `${origin}${basePath}`
}
```

Used by: `llms.txt`, `sitemap.xml`, `robots.txt`, `ai.txt`, JSON-LD, admin GEO page.

> **`SITE_URL`** (server-only, runtime) overrides `NEXT_PUBLIC_SITE_URL` for all SEO URLs. Set it in production to fix sitemap showing `localhost` without rebuilding.

---

### Public page URLs (admin preview)

**File:** `frontend/lib/public-urls.ts`

```ts
export function cmsPublicPagePath(locale: 'en' | 'ar', slug: string) {
  return withBasePath(getPathname({ locale, href: `/${slug}` }))
}
```

Used by:
- `frontend/app/admin/library/page.tsx` — EN/AR open links
- `frontend/app/admin/library/[slug]/page.tsx` — View page button

---

### Admin preview buttons

**File:** `frontend/components/admin-shell.tsx`

```tsx
<a href={withBasePath('/')} target="_blank">  {/* معاينة / View live */}
```

---

### Admin session cookies

**File:** `frontend/lib/admin-session.ts`

```ts
const COOKIE_PATH = basePath || '/'
export const ADMIN_SESSION_IDLE_MS = 5 * 60 * 1000   // 5 min
```

Used by: `login/route.ts`, `logout/route.ts`, `proxy/route.ts`, `upload/route.ts`, `indexnow/route.ts`

---

### Backend CORS

**File:** `backend/src/config.ts`

```ts
corsOrigin: required('CORS_ORIGIN', 'http://localhost:3003'),
```

Reads from `backend/.env` or Docker environment.

---

## 3. Files that use `withBasePath` (auto — no manual edits)

You normally **do not** edit these when changing env vars.

| File | What it does |
|------|-------------|
| `frontend/components/app-image.tsx` | Prefixes image `src` when base path is set |
| `frontend/components/admin-shell.tsx` | Logout API, preview links |
| `frontend/components/admin-session-guard.tsx` | Idle logout API |
| `frontend/components/admin-image-picker.tsx` | Upload API |
| `frontend/components/admin-media-preview.tsx` | Media preview paths |
| `frontend/components/admin-locale-provider.tsx` | Admin UI locale cookie path |
| `frontend/components/site-header.tsx` | PDF link, locale switcher |
| `frontend/lib/cms-nav.ts` | CMS nav API fetch |
| `frontend/app/admin/**/page.tsx` | All admin pages — API proxy calls |
| `frontend/app/api/admin/login/route.ts` | Login cookie path |
| `frontend/app/api/admin/logout/route.ts` | Logout cookie path |
| `frontend/app/api/admin/proxy/[...path]/route.ts` | API proxy + sliding cookie |
| `frontend/app/robots.ts` | Disallow `/admin`, `/api/` |
| `frontend/scripts/submit-indexnow.mjs` | IndexNow URL submission |

---

## 4. Geo / SEO files (auto-generated from env)

These URLs are built from `getSiteUrl()`. Change env only — no code edits.

| File / route | Local URL |
|-------------|-----------|
| `llms.txt` | `http://localhost:3003/llms.txt` |
| `llms-full.txt` | `http://localhost:3003/llms-full.txt` |
| `llms-small.txt` | `http://localhost:3003/llms-small.txt` |
| `sitemap.xml` | `http://localhost:3003/sitemap.xml` |
| `robots.txt` | `http://localhost:3003/robots.txt` |
| `.well-known/ai.txt` | `http://localhost:3003/.well-known/ai.txt` |
| `BingSiteAuth.xml` | `http://localhost:3003/BingSiteAuth.xml` (when `BING_SITE_AUTH_CODE` is set) |
| `googled43fdb9897d9f8a7.html` | `http://localhost:3003/googled43fdb9897d9f8a7.html` |

**Code:** `frontend/lib/geo-content.ts`, `frontend/app/sitemap.ts`, `frontend/app/robots.ts`, `frontend/app/BingSiteAuth.xml/route.ts`, `frontend/app/api/google-site-verification/route.ts`

**Docs:** `docs/geo-chatbot-tests.md`

### Bing Webmaster site verification

1. In Bing Webmaster Tools → Add site → **Verify** → choose XML file or Meta tag.
2. Copy the `<user>` code into env:

   ```env
   BING_SITE_AUTH_CODE=your-bing-verification-code
   ```

3. Rebuild frontend: `docker compose build frontend && docker compose up -d`
4. Confirm `https://bab.com.sa/BingSiteAuth.xml` returns valid XML.
5. Click **Verify** in Bing Webmaster Tools.

The same code also adds `<meta name="msvalidate.01" content="...">` on all public pages.

### Google Search Console site verification

1. In Google Search Console → Add property → **HTML file** verification.
2. Set env (filename without `.html`):

   ```env
   GOOGLE_SITE_VERIFICATION=googled43fdb9897d9f8a7
   ```

3. Rebuild frontend: `docker compose build frontend && docker compose up -d`
4. Confirm `https://bab.com.sa/googled43fdb9897d9f8a7.html` returns:

   ```
   google-site-verification: googled43fdb9897d9f8a7.html
   ```

5. Click **Verify** in Search Console, then submit `https://bab.com.sa/sitemap.xml` under **Sitemaps**.

Also adds `<meta name="google-site-verification" content="googled43fdb9897d9f8a7">` on all public pages.

---

## 5. Production deployment

Nginx proxies `https://bab.com.sa/` → `http://127.0.0.1:3003/` with **no path rewriting**.

### Nginx

See [`docs/nginx.conf.example`](nginx.conf.example):

```nginx
location / {
    proxy_pass http://127.0.0.1:3003;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Env vars (root `.env` next to `docker-compose.yml`)

```env
SITE_URL=https://bab.com.sa
NEXT_PUBLIC_SITE_URL=https://bab.com.sa
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_API_URL=http://localhost:4001
CORS_ORIGIN=https://bab.com.sa
JWT_SECRET=<strong-secret>
ADMIN_PASSWORD=<strong-password>
```

### Quick fix (sitemap shows localhost — no rebuild)

```bash
# Add to .env on server:
SITE_URL=https://bab.com.sa

docker compose up -d
curl -s https://bab.com.sa/sitemap.xml | head -5
```

### Backend (`backend/.env` on server)

```env
CORS_ORIGIN=https://bab.com.sa
```

### Rebuild and verify

```bash
docker compose build frontend
docker compose up -d
```

| URL | Expected |
|-----|----------|
| `https://bab.com.sa/` | 200 |
| `https://bab.com.sa/admin` | Admin login |
| `https://bab.com.sa/sitemap.xml` | Sitemap with `https://bab.com.sa/...` URLs |
| `https://bab.com.sa/ar/omnichannel` | Arabic page |
| Admin preview (معاينة) | Opens `https://bab.com.sa/...` |

Submit sitemap via admin GEO page or:

```bash
cd frontend && npm run seo:submit-indexnow
```

---

## 6. Troubleshooting

| Problem | Fix |
|---------|-----|
| Sitemap/robots show `http://localhost:3003` | Set `SITE_URL=https://bab.com.sa` in `.env`, run `docker compose up -d` |
| `http://localhost:3003/` shows 404 | Rebuild frontend Docker image |
| Admin preview opens wrong path | Rebuild frontend Docker image |
| Images broken (404) | Ensure `AppImage` is used; rebuild frontend |
| CORS errors in admin | Set `CORS_ORIGIN=http://localhost:3003` in `backend/.env` |
| Language button goes to `/ar/ar` | Rebuild frontend |
| GEO page shows `localhost:3003` | Set `SITE_URL=https://bab.com.sa` in production `.env` |
| Changes not visible in Docker | Run `docker compose build frontend` then `up -d` |

---

## 7. Files NOT in git (local secrets)

| File | Purpose |
|------|---------|
| `frontend/.env.local` | Frontend local env |
| `backend/.env` | Backend local env |

Never commit these. Copy from `.env.example` files.

---

## Export to PDF

To create a PDF from this file:

1. Open `docs/configuration-guide.md` in VS Code / Cursor
2. Install extension **"Markdown PDF"** or use **Print → Save as PDF** from preview
3. Or run: `npx md-to-pdf docs/configuration-guide.md`
