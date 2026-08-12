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

- Web: http://localhost:3000
- API: http://localhost:4001/api/health

Stop: `npm run docker:down`

Optional env (compose substitutes from shell or a root `.env`):

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4001` |
| `NEXT_PUBLIC_SITE_URL` | `https://bab.com.sa` |
| `INDEXNOW_KEY` | empty |
| `JWT_SECRET` | `change-me-in-production-bab-cms` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@bab.com.sa` / `Admin123!` |

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
