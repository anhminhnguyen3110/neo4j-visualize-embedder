# Multi-stage Dockerfile for Hono + Neo4j application
# Optimized for production with minimal image size

# ============================================
# Stage 1: Base - Setup base environment
# ============================================
FROM node:20-alpine AS base
WORKDIR /app

# Install necessary tools
RUN apk add --no-cache bash curl && \
    npm install -g pnpm node-prune

# ============================================
# Stage 2: Dependencies - Install all dependencies
# ============================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile && \
    pnpm store prune

# ============================================
# Stage 3: Build - Build TypeScript to JavaScript
# ============================================
FROM base AS build
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build

# ============================================
# Stage 3.5: Test - Keep dev dependencies for testing
# ============================================
FROM build AS test-build
WORKDIR /app

# Keep all dependencies (including dev) for testing
# No cleanup here - tests need jest and other dev dependencies

# ============================================
# Stage 4: Build Production - Clean up for production
# ============================================
FROM build AS build-prod
WORKDIR /app

# Remove dev dependencies and clean up
RUN rm -rf node_modules && \
    pnpm install --prod --frozen-lockfile --ignore-scripts && \
    npx node-prune && \
    rm -rf .git tests coverage ./**.test.ts ./**.spec.ts

# ============================================
# Stage 5: Runner - Production runtime
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy package files
COPY --chown=hono:nodejs package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune

# Copy built application from build stage
COPY --from=build-prod --chown=hono:nodejs /app/dist ./dist
COPY --from=build-prod --chown=hono:nodejs /app/public ./public
COPY --from=build-prod --chown=hono:nodejs /app/src/scripts ./src/scripts

# Switch to non-root user
USER hono

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["pnpm", "start"]
