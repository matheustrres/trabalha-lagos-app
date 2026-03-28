# CLAUDE.md — TrabalhaLagos Backend

Plataforma de vagas de emprego hiperlocal para a Região dos Lagos (RJ). Busca geoespacial por raio em KM. Candidato usa grátis, empregador paga planos premium (R$29-49/mês).

## Stack

NestJS (TypeScript) · Drizzle ORM · PostgreSQL + PostGIS · Redis · BullMQ

## Comandos

```bash
docker compose up -d                     # PostgreSQL (PostGIS) + Redis
pnpm start:dev                        # NestJS watch mode
npx drizzle-kit generate                 # Gerar migration a partir do schema
npx drizzle-kit migrate                  # Aplicar migrations pendentes
npx drizzle-kit studio                   # GUI do banco (Drizzle Studio)
pnpm db:seed                          # Seed (categorias, cidades)
pnpm test                             # Unit tests (Jest)
pnpm test:e2e                         # Integration tests (Supertest)
pnpm lint:fix                         # ESLint + autofix
```

## Arquitetura

Monolito modular NestJS. Cada feature é um módulo independente em `src/modules/`.

```
src/
├── common/          # Guards, decorators, pipes, utils (cross-cutting APENAS)
├── database/
│   ├── schema/      # Drizzle schemas (tabelas, enums, relações, tipos PostGIS)
│   ├── migrations/  # Migrations geradas pelo drizzle-kit
│   ├── seed.ts      # Seed de categorias e cidades
│   └── index.ts     # Drizzle client instance + provider NestJS
├── modules/
│   ├── auth/        # JWT (access 15min + refresh 7d)
│   ├── users/       # Candidatos
│   ├── companies/   # Empregadores (1:1 com User role=EMPLOYER)
│   ├── jobs/        # Vagas + busca PostGIS (o core do produto)
│   ├── interests/   # "Tenho interesse" — candidato→vaga
│   ├── categories/  # Árvore de categorias (self-ref parentId)
│   ├── geo/         # Geocoding (Nominatim), coordenadas
│   ├── payments/    # Asaas — Pix, cartão (v1.5)
│   ├── notifications/
│   └── admin/
└── drizzle.config.ts  # Config do drizzle-kit
```

Padrão por módulo: `controller → service → repository`. Controller valida input e chama service. Service orquestra lógica de negócio. Repository encapsula Drizzle queries — **única camada que toca o banco**.

## Documentação Detalhada

Antes de trabalhar em um módulo ou domínio específico, leia o documento relevante em `docs/`. Estes arquivos contêm regras de negócio, schemas, exemplos e detalhes que não cabem aqui.

```
docs/
├── database.md          # Schema Drizzle, PostGIS setup, column geometry, queries geo
├── api.md               # Endpoints REST, DTOs (Zod), validação, paginação, versionamento
├── auth.md              # JWT flow, guards (@Public, @Roles, @RequiresPlan), regras de acesso
├── business-rules.md    # Limites por plano, expiração, moderação, regras críticas
├── payments.md          # Integração Asaas, webhook flow, planos (FREE/PRO/SEASON)
├── caching.md           # Redis keys, TTLs, invalidação
├── queues.md            # BullMQ queues, processors, crons
├── geo.md               # Cidades da Região dos Lagos, coordenadas, raios, geocoding
├── testing.md           # Convenções de teste, fixtures, testcontainers
└── infrastructure.md    # Docker Compose, deploy, env vars, CI/CD
```

## Regras Inegociáveis

Estas regras se aplicam a TODA tarefa, sem exceção:

1. **Camadas**: controller nunca faz query. Service nunca importa outro service diretamente — importar o módulo.
2. **PostGIS**: `ST_MakePoint` recebe `(longitude, latitude)` — nessa ordem. Distância em metros, converter km × 1000.
3. **Validação**: todo input de controller usa Zod schema via `ZodValidationPipe`. Sem `any`.
4. **IDs**: `cuid2` gerado via `@paralleldrive/cuid2` como default no schema Drizzle.
5. **Schema centralizado**: todas as tabelas definidas em `src/database/schema/`. Não criar tabelas fora.
6. **PostGIS queries**: usar `sql` template literals do Drizzle para operações geoespaciais — composíveis e safe contra SQL injection.
7. **Testes**: rodar `pnpm test` antes de considerar qualquer tarefa concluída.
8. **Strict mode**: TypeScript strict ativado. Sem `any` implícito, sem `!` assertion sem justificativa.

## Convenções Rápidas

- Arquivos: `kebab-case` · Classes: `PascalCase` · Constantes: `UPPER_SNAKE_CASE`
- Commits: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`)
- Imports absolutos: `@/common/`, `@/modules/`, `@/database/`
- Enums definidos no schema Drizzle com `pgEnum` — importar de `@/database/schema`