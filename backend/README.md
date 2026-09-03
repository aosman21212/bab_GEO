# BAB CMS API (backend)

Express + MongoDB + Redis backend for the BAB Next.js frontend.

## Docker (from monorepo root)

```bash
npm run docker:up
npm run docker:seed
```

API: `http://localhost:4001` — Frontend: `http://localhost:3003`

See root [`README.md`](../README.md).

## Local setup (API on host)

Prerequisites:

- Node 20+
- MongoDB on `mongodb://127.0.0.1:27018` (or Compose `mongo` service)
- Redis on `redis://127.0.0.1:6379`

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

From the monorepo root:

```bash
npm run seed
npm run dev:server
# or both web + api:
npm run dev:all
```

Default admin comes from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Set them before `npm run seed`.  
In production (`NODE_ENV=production`), weak passwords such as `Admin123!` are rejected at API boot.

## Main routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | no | Health check |
| POST | `/api/auth/login` | no | Admin JWT |
| GET | `/api/content/:locale` | no | CMS namespaces |
| PUT | `/api/content/:locale/:key` | yes | Update namespace |
| GET | `/api/partners` | no | Active partners |
| GET | `/api/testimonials` | no | Active testimonials |
| GET | `/api/pages` | yes | List all pages (admin) |
| POST | `/api/pages` | yes | Create page |
| GET | `/api/pages/by-id/:slug` | yes | Full page document |
| GET | `/api/pages/:slug?locale=` | no | Public merged page |
| PUT | `/api/pages/:slug` | yes | Update page |
| DELETE | `/api/pages/:slug` | yes | Delete page |
| POST | `/api/uploads` | yes | Image upload → `frontend/public/uploads/...` |
| GET | `/api/inquiries` | yes | List inquiries |

Redis caches public GETs (~5 min) and is invalidated on writes. If Redis is down, the API still works without cache.
