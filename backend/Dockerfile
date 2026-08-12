# Build context: monorepo root (.)
FROM node:20-alpine AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm install tsx@4.19.3 --no-save --no-audit --no-fund
COPY --from=build /app/backend/dist ./dist
COPY backend/src ./src
COPY backend/seed-data ./seed-data
COPY backend/tsconfig.json ./tsconfig.json
COPY frontend/messages /app/frontend/messages
RUN mkdir -p /app/frontend/public/uploads
EXPOSE 4001
CMD ["node", "dist/index.js"]
