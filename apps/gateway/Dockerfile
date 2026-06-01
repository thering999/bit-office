FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    sudo \
    ripgrep \
    && rm -rf /var/lib/apt/lists/*


# Install npm global tools
RUN npm install -g pnpm @google/gemini-cli opencode-ai @anthropic-ai/claude-code openclaw@latest \
    mcp-server-sqlite repomix-mcp @modelcontextprotocol/server-everything

# Install Aider (Python tool)
# We use --break-system-packages for simplicity in a dedicated container
RUN pip3 install --default-timeout=1000 --break-system-packages aider-chat

WORKDIR /app

COPY . /app

# Force fresh build by breaking cache for the next steps
ARG BUILD_ID=1
RUN echo "Build ID: ${BUILD_ID}"

# Install dependencies and build inside the container
RUN PNPM_CONFIG_FETCH_TIMEOUT=1000000 \
    PNPM_CONFIG_NETWORK_CONCURRENCY=1 \
    PNPM_CONFIG_MAX_RETRIES=10 \
    pnpm install --no-frozen-lockfile --ignore-scripts && \
    pnpm rebuild better-sqlite3 esbuild sharp && \
    pnpm --filter web build && \
    pnpm --filter bit-office build

# Environment setup
ENV NODE_ENV=production
ENV GEMINI_CLI_TRUST_WORKSPACE=true
ENV PORT=9100
ENV WS_PORT=9100

EXPOSE 9100

# Ensure we have a place for the workspace and configs
RUN mkdir -p /app/workspace /root/.bit-office /root/.claude /root/.config /root/.gemini/hooks
COPY .gemini/hooks/rtk_silent_hook.js /root/.gemini/hooks/rtk_silent_hook.js

# Setup a default workspace
ENV WORKSPACE=/app/workspace
ENV GEMINI_HOOKS_PATH=/root/.gemini/hooks

# Command to start both gateway and web app internally
# We use port 9101 for the web app internally so it doesn't conflict with anything on the host
CMD ["npx", "concurrently", "-n", "gateway,web", "-c", "blue,green", "\"node apps/gateway/dist/index.js\"", "\"pnpm --filter web start --port 9101\""]
