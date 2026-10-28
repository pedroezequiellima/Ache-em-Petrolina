# 1. Fase de Build
FROM node:24-alpine AS builder
WORKDIR /app

# Copia os arquivos de configuração do monorepo
COPY package.json package-lock.json ./
COPY . .

# Instala dependências
RUN npm ci

# Gera o cliente do Prisma e compila o NestJS
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

# 2. Fase de Produção (Imagem menor e segura)
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Remove permissão de root do contêiner
RUN chown -R node:node /app
USER node

WORKDIR /app/apps/backend
EXPOSE 3001

CMD ["npm", "run", "start:prod"]