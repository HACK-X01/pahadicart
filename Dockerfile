# PahadiCart Ultra-Lightweight Himalayan Hyperlocal Server
FROM node:20-alpine
WORKDIR /app
COPY . .
ENV PORT=3333
ENV NODE_ENV=production
EXPOSE 3333
CMD ["node", "server.js"]
