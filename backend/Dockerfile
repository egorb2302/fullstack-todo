FROM node:20-alpine AS builder

WORKDIR /backend

COPY package*.json ./
RUN npm ci

ARG CACHEBUST=1

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /backend

COPY --from=builder /backend/package*.json ./

COPY --from=builder /backend/node_modules ./node_modules

COPY --from=builder /backend/src ./src
COPY --from=builder /backend/dist ./dist

COPY --from=builder /backend/drizzle.config.js ./

EXPOSE 5000

CMD ["sh", "-c", "node node_modules/drizzle-kit/bin.cjs migrate && node dist/server.js"]