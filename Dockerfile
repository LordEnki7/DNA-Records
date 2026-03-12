# ─── Stage 1: Install all dependencies ───────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# ─── Stage 2: Build (Vite frontend + esbuild backend) ─────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─── Stage 3: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies (needed for esbuild-external modules)
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Persistent volume mount point for user-uploaded files
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "dist/index.cjs"]
