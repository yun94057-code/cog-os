# Cognitive OS Memory Server — Fly.io Deployment
FROM node:22-alpine

WORKDIR /app

# Dependencies first (caching layer)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Application code
COPY server.js ./

# Persistent data directory (mounted as volume)
RUN mkdir -p /app/data

EXPOSE 3456

CMD ["node", "server.js"]
