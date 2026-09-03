# BAB monorepo

- [`frontend/`](frontend/) — Next.js marketing site + admin + GEO
- [`backend/`](backend/) — Express CMS API (MongoDB + Redis)

## Docker (recommended)

Requires Docker Desktop / Compose v2.

```bash
# build + start mongo, redis, backend, frontend
npm run docker:up

# seed CMS (admin + content + pages)
npm run docker:seed
```

- Web: http://localhost:3003
- API: http://localhost:4001/api/health

Stop: `npm run docker:down`

Optional env (compose reads from a root `.env` — **required** for Docker):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Default `http://localhost:4001` |
| `NEXT_PUBLIC_SITE_URL` | Default `http://localhost:3003` |
| `JWT_SECRET` | **Required** — 24+ char secret (production rejects weak known values) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | **Password required** — 12+ chars; set in `.env`, not committed |

After setting `ADMIN_PASSWORD`, run `npm run docker:seed` so the admin user matches.

Inside Docker, the frontend uses `API_URL=http://backend:4001` for server-side fetches while the browser still calls `NEXT_PUBLIC_API_URL`.

## Local (without Docker app containers)

You can still run Next/Express on the host (Mongo/Redis via Docker or local installs):

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
npm run seed
npm run dev:all
```

See [`backend/README.md`](backend/README.md) for details.
