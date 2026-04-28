# Use Node.js LTS version
FROM node:20-alpine3.21 AS base

# Install dependencies only when needed
FROM base AS deps

RUN echo "https://mirror.arvancloud.ir/alpine/v3.21/main" > /etc/apk/repositories && \
    echo "https://mirror.arvancloud.ir/alpine/v3.21/community" >> /etc/apk/repositories

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json yarn.lock  package-lock.json* ./

RUN npm config set registry https://repo.hmirror.ir/npm
RUN yarn config set registry https://repo.hmirror.ir/npm
RUN yarn install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build time
ARG HOME_SITE_URL
ARG MONGODB_URI
ARG SITE_URL

ENV HOME_SITE_URL=${HOME_SITE_URL}
ENV MONGODB_URI=${MONGODB_URI}
ENV SITE_URL=${SITE_URL}

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
