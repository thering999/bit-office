FROM node:22-bookworm

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/orchestrator/package.json ./packages/orchestrator/

# Copy source (we do this before install to ensure pnpm sees everything for the build step)
COPY . .

# Install dependencies and build in one go to preserve pnpm state
RUN PNPM_CONFIG_FETCH_TIMEOUT=1000000 \
    PNPM_CONFIG_NETWORK_CONCURRENCY=1 \
    PNPM_CONFIG_MAX_RETRIES=10 \
    pnpm install --no-frozen-lockfile --ignore-scripts && \
    pnpm rebuild better-sqlite3 esbuild sharp && \
    pnpm --filter "web" build

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]
