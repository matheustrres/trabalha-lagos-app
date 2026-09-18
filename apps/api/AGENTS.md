# AGENTS.md — TrabalhaLagos API

Backend da plataforma TrabalhaLagos, Plataforma de vagas de emprego hiperlocal 
para a Região dos Lagos (RJ). API REST com busca geoespacial por raio em KM via PostGIS.

## Stack

NestJS (TypeScript) · Drizzle ORM · PostgreSQL + PostGIS · Redis · BullMQ

## Comandos

```bash
pnpm dev                                 # NestJS watch mode
pnpm exec drizzle-kit generate           # Gerar migration a partir do schema
pnpm exec drizzle-kit migrate            # Aplicar migrations pendentes
pnpm exec drizzle-kit studio             # GUI do banco (Drizzle Studio)
pnpm db:seed                             # Seed (categorias)
pnpm test:unit                           # Unit tests (Vitest)
pnpm test:e2e                            # Integration tests
pnpm lint:fix                            # ESLint + autofix
```

## Arquitetura

Monolito modular NestJS. Cada feature é um módulo independente em `src/modules/`.

```
src/
├── common/          # Guards, decorators, pipes, utils (cross-cutting APENAS)
├── modules/
│   ├── auth/        # JWT (access 15min + refresh 7d)
│   ├── users/       # Candidatos
│   ├── companies/   # Empregadores (1:1 com User role=EMPLOYER)
│   ├── jobs/        # Vagas + busca PostGIS (o core do produto)
│   ├── interests/   # "Tenho interesse" — candidato→vaga
│   ├── categories/  # Categorias de vagas (seeded, raramente muda)
│   ├── geo/         # Geocoding (Nominatim), coordenadas
│   ├── payments/    # Asaas — Pix, cartão (v1.5)
│   ├── notifications/
│   └── admin/
├── shared/
│   ├── database/
│   │  ├── migrations/              # Migrations geradas pelo drizzle-kit
│   │  ├── schema/                  # Drizzle schemas (tabelas, enums, relações, tipos PostGIS)
│   │  ├── database.module.ts       # Database module + providers
│   │  └── database.provider.ts     # Drizzle client instance + provider NestJS
│   │  ├── seed.ts                  # Seed de categorias
└── drizzle.config.ts  # Config do drizzle-kit
```

Padrão por módulo: `controller → service → repository`. Controller valida input e chama service. Service orquestra lógica de negócio. Repository encapsula Drizzle queries — **única camada que toca o banco**.

## Documentação Detalhada

Antes de trabalhar em um módulo ou domínio específico, leia o documento relevante em `/trabalha-lagos/docs/database.md`. Estes arquivos contêm regras de negócio, schemas, exemplos e detalhes que não cabem aqui.

```
docs/
├── database.md          # Schema Drizzle, PostGIS setup, column geometry, queries geo, estratégia de IDs
├── api.md               # Endpoints REST, DTOs (class-validator, class-transformer), validação, paginação, versionamento
├── auth.md              # JWT flow, guards (@Public, @Roles, @RequiresPlan), regras de acesso
├── business-rules.md    # Limites por plano, expiração, moderação, regras críticas
├── payments.md          # Integração Asaas, webhook flow, planos (FREE/PRO/SEASON)
├── caching.md           # Redis keys, TTLs, invalidação
├── queues.md            # BullMQ queues, processors, crons
├── geo.md               # Cidades (constantes no código), coordenadas, raios, geocoding
├── testing.md           # Convenções de teste, fixtures, testcontainers
└── infrastructure.md    # Docker Compose, deploy, env vars, CI/CD
```

## Regras Inegociáveis

Estas regras se aplicam a TODA tarefa, sem exceção:

1. **Camadas**: controller nunca faz query. Service nunca importa outro service diretamente — importar o módulo.
2. **PostGIS**: `ST_MakePoint` recebe `(longitude, latitude)` — nessa ordem. Distância em metros, converter km × 1000.
3. **Validação**: todo input de controller usa class-validator + class-transformer schema. Sem `any`.
4. **IDs**: `uuid v7` (via pacote `uuidv7`) para entidades de negócio (users, companies, jobs, interests). `serial` para tabelas de referência (categories). Ver `/trabalha-lagos/docs/database.md` para detalhes.
5. **Schema centralizado**: todas as tabelas definidas em `src/database/schema/`. Não criar tabelas fora.
6. **PostGIS queries**: usar `sql` template literals do Drizzle para operações geoespaciais — composíveis e safe contra SQL injection.
7. **Testes**: rodar `npm run test` antes de considerar qualquer tarefa concluída.
8. **Strict mode**: TypeScript strict ativado. Sem `any` implícito, sem `!` assertion sem justificativa.
9. **Cidades são constantes**: cidades da Região dos Lagos vivem em `src/common/constants/cities.ts`, não no banco.

## Convenções Rápidas

- Arquivos: `kebab-case` · Classes: `PascalCase` · Constantes: `UPPER_SNAKE_CASE`
- Commits: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`)
- Imports absolutos: `@/common/`, `@/modules/`, `@/database/`
- Enums definidos no schema Drizzle com `pgEnum` — importar de `@/database/schema`
