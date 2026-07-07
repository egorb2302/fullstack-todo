FROM node:24-alpine AS builder

WORKDIR /backend

COPY package*.json ./
RUN npm ci

ARG CACHEBUST=1

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /backend

COPY --from=builder /backend/package*.json ./

COPY --from=builder /backend/node_modules ./node_modules

COPY --from=builder /backend/dist ./dist

COPY --from=builder /backend/drizzle.config.js ./

COPY --from=builder /backend/src/db/migrations ./src/db/migrations

EXPOSE 5000

CMD ["sh", "-c", "npm run db:migrate && echo MIGRATION_OK && node dist/server.js"]