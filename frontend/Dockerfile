# Build context: frontend/
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:4001
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3003
ARG NEXT_PUBLIC_BASE_PATH=
ARG INDEXNOW_KEY=
ARG BING_SITE_AUTH_CODE=
ARG GOOGLE_SITE_VERIFICATION=googled43fdb9897d9f8a7
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV INDEXNOW_KEY=$INDEXNOW_KEY
ENV BING_SITE_AUTH_CODE=$BING_SITE_AUTH_CODE
ENV GOOGLE_SITE_VERIFICATION=$GOOGLE_SITE_VERIFICATION
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_PRIVATE_WORKERS=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
