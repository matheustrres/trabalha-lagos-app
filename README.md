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
cp apps/api/.env.sample apps/api/.env.dev
cp apps/client/.env.example apps/client/.env.local
```

### 3) Subir infraestrutura (PostgreSQL + Redis)

```bash
pnpm dev:infra
```

### 4) Rodar API e client

```bash
pnpm dev
```

Também é possível iniciar cada app separadamente:

```bash
pnpm dev:api
pnpm dev:client
```

## Variáveis de ambiente

### `apps/client/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:3004/api/v1
API_URL=http://localhost:3004/api/v1
```

### `apps/api/.env.sample`

```env
DATABASE_URL=postgresql://trabalhalagos:dev_password@localhost:5432/trabalhalagos_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
PORT=3004
CORS_ORIGINS=http://localhost:3000
```

## Comandos principais

```bash
# Desenvolvimento
pnpm dev:infra
pnpm dev
pnpm dev:api
pnpm dev:client

# Validação por app
pnpm --filter @trabalha-lagos/api test:unit
pnpm --filter @trabalha-lagos/api build
pnpm --filter @trabalha-lagos/client lint
pnpm --filter @trabalha-lagos/client build
```
