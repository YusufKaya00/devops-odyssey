# 1. Aşama: Build (React'i derle)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx vite build

# 2. Aşama: Çalıştırma (Node.js API + Frontend)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY server/ ./server/
COPY scripts/ ./scripts/

EXPOSE 5001
ENV PORT=5001
CMD ["node", "server.js"]