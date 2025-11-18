# Estágio 1: Instalação de dependências
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Estágio 2: Build da aplicação
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# A MONGODB_URI será passada pelo Docker Compose
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
RUN npm run build

# Estágio 3: Imagem final de produção
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
