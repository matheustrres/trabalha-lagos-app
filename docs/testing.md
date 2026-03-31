# Infraestrutura — TrabalhaLagos

## Docker Compose (dev)

```yaml
version: "3.8"
services:
  postgres:
    image: postgis/postgis:16-3.4 # NÃO usar postgres puro
    environment:
      POSTGRES_USER: trabalhalagos
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: trabalhalagos_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

## Variáveis de Ambiente

```env
# Banco
DATABASE_URL=postgresql://trabalhalagos:dev_password@localhost:5432/trabalhalagos_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=<openssl rand -hex 32>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<openssl rand -hex 32>
JWT_REFRESH_EXPIRES_IN=7d

# Asaas (v1.5)
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_SANDBOX=true

# Geocoding
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=trabalhalagos-backend

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001
```

## Dependências Principais

```json
{
  "drizzle-orm": "latest",
  "drizzle-kit": "latest",
  "pg": "^8.x",
  "uuidv7": "^1.1.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.1",
  "@nestjs/core": "^10.x",
  "bullmq": "^5.x",
  "ioredis": "^5.x"
}
```

## Deploy

### MVP (custo mínimo)

| Componente | Opção                       | Custo     |
| ---------- | --------------------------- | --------- |
| Backend    | Railway ou Render           | $0-7/mês  |
| Frontend   | Vercel (free tier)          | $0        |
| Banco      | Neon (PostgreSQL + PostGIS) | $0-19/mês |
| Redis      | Upstash (serverless)        | $0        |
| Storage    | Cloudflare R2               | $0        |

**Nota sobre Neon:** confirmar que a instância suporta PostGIS. Neon habilita PostGIS por padrão em todas as instâncias.

### Produção

| Componente | Opção                            |
| ---------- | -------------------------------- |
| Backend    | AWS ECS Fargate ou EC2           |
| Frontend   | Vercel                           |
| Banco      | AWS RDS PostgreSQL (com PostGIS) |
| Redis      | AWS ElastiCache ou Upstash       |
| CDN        | CloudFront ou Cloudflare         |
| Storage    | S3 ou Cloudflare R2              |

## CI/CD (GitHub Actions)

```
push to staging → lint → test → deploy staging
push to main → lint → test → drizzle-kit migrate → deploy prod → notify Sentry
```

## Monitoramento (custo zero)

- **Sentry** (free tier) — error tracking
- **Google Analytics 4** — tráfego
- **Google Search Console** — SEO
- **Uptime Robot** (free) — uptime
