# Multi-stage build for cross-platform support
FROM node:18-alpine AS base

# Install dependencies needed for Android support
RUN apk add --no-cache \
    python3 \
    py3-pip \
    docker \
    docker-compose \
    git \
    curl \
    wget \
    unzip \
    build-base \
    python3-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    rust

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    docker \
    docker-compose \
    curl \
    wget \
    unzip \
    build-base \
    python3-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    rust

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package*.json ./
COPY --from=base /app/pnpm-lock.yaml ./

# Install production dependencies
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# Copy necessary files
COPY --from=base /app/next.config.mjs ./
COPY --from=base /app/middleware.ts ./
COPY --from=base /app/lib ./lib
COPY --from=base /app/scripts ./scripts

# Create bot containers directory
RUN mkdir -p /app/bot-containers

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["pnpm", "start"]
