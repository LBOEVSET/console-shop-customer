# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Pass them via --build-arg in docker build (or GitHub Actions secrets).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_OMISE_PUBLIC_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_OMISE_PUBLIC_KEY=$NEXT_PUBLIC_OMISE_PUBLIC_KEY
ENV NODE_ENV=production

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runner (uses Next.js standalone output)
# The standalone build creates .next/standalone — a minimal Node.js server
# that does NOT need node_modules at runtime.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy the self-contained server
COPY --from=builder /app/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=builder /app/.next/static ./.next/static
# Copy public folder (favicon, og images, etc.)
COPY --from=builder /app/public ./public

EXPOSE 3022

# INTERNAL_API_URL is read at runtime by the proxy route handler.
# Set it in the k8s deployment env — default falls back to localhost for local use.
# PORT is also read at runtime by the standalone server (default 3000).
ENV PORT=3022

CMD ["node", "server.js"]
