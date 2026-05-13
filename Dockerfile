# Backend API only — repo root has no package.json, so Railway/Nixpacks cannot auto-detect Node.
FROM node:20-alpine
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./

ENV NODE_ENV=production
CMD ["node", "src/server.js"]
