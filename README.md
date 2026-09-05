# BAB monorepo

- [`frontend/`](frontend/) — Next.js marketing site + admin + GEO
- [`backend/`](backend/) — Express CMS API (MongoDB + Redis)

## Docker (recommended)

Requires Docker Desktop / Compose v2.

```bash
# rebuild frontend + backend only (mongo/redis stay as-is)
npm run docker:up

# optional alias for the same rebuild
npm run docker:rebuild

# seed CMS (admin + content + pages) — opt-in; overwrites Mongo data
npm run docker:seed
```

CMS data lives in the `mongo_data` volume. `docker:up` / `docker:rebuild` start mongo/redis if they are stopped, but do not rebuild the mongo image or wipe that volume. Do not use `docker compose down -v` unless you intend to delete the database.

- Web: http://localhost:3003
- API: http://localhost:4001/api/health

Stop (containers only, volumes kept): `npm run docker:down`

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
