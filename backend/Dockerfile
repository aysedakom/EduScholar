
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat


FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000


RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER expressjs

EXPOSE 5000

CMD ["node", "index.js"]
