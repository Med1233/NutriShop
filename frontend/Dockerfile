FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy package.json files for all workspace packages
COPY frontend/package.json ./frontend/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile || pnpm install

# Copy source files
COPY packages/ui/ ./packages/ui/
COPY frontend/ ./frontend/

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN pnpm --filter frontend build

# Resolve pnpm symlinks in standalone node_modules by copying
# real files from the original frontend/node_modules (where symlinks still resolve)
RUN rm -rf /app/frontend/.next/standalone/node_modules && \
    cp -rL /app/frontend/node_modules /app/frontend/.next/standalone/node_modules

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
