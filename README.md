# TrabalhaLagos

![CI](https://github.com/matheustrres/trabalha-lagos-app/actions/workflows/ci.yml/badge.svg)

TrabalhaLagos é uma plataforma de vagas hiperlocal para a Região dos Lagos (RJ), conectando candidatos e empregadores com busca por cidade, categoria e raio geográfico. O projeto é um monorepo com API NestJS (PostgreSQL/PostGIS + Redis) e frontend Next.js focado em SEO e experiência mobile-first.

## Como rodar localmente

### 1) Instalar dependências

```bash
pnpm install
```

### 2) Configurar variáveis de ambiente

```bash
cp apps/api/.env.example apps/api/.env
cp apps/client/.env.example apps/client/.env.local
```

### 3) Subir infraestrutura (PostgreSQL + Redis)

```bash
cd apps/api && docker compose up -d
```

### 4) Rodar API

```bash
cd apps/api && pnpm start:dev
```

### 5) Rodar Client

```bash
cd apps/client && pnpm dev
```

## Variáveis de ambiente

### `apps/client/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
API_URL=http://localhost:3001/api/v1
```

### `apps/api/.env.example`

```env
DATABASE_URL=postgresql://trabalhalagos:dev_password@localhost:5432/trabalhalagos_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

## Comandos principais

```bash
# Infra
cd apps/api && docker compose up -d

# API
cd apps/api && pnpm start:dev
cd apps/api && pnpm test
cd apps/api && pnpm build

# Client
cd apps/client && pnpm dev
cd apps/client && pnpm lint
cd apps/client && pnpm build
```
