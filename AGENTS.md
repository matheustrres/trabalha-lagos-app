# TrabalhaLagos

Plataforma de vagas de emprego hiperlocal para a Região dos Lagos (RJ). Busca geoespacial por raio em KM. Candidato usa grátis, empregador paga planos premium (R$29-49/mês).

## Estrutura do Monorepo

```
root/
├── apps/
│   ├── api/           # Backend — NestJS, Drizzle, PostgreSQL + PostGIS, Redis, BullMQ
│   └── client/        # Frontend — Next.js 15 (App Router), React 19, Tailwind CSS v4
└── docs/              # Documentação detalhada (progressive disclosure)
```

Cada app tem seu próprio `AGENTS.md` com stack, comandos e regras específicas. **Leia o AGENTS.md da app alvo antes de qualquer tarefa.**

## Comandos Globais

```bash
# Na raiz do projeto
pnpm dev:infra    # PostgreSQL (PostGIS) + Redis
pnpm dev          # API e client em paralelo
pnpm dev:api      # somente API, NestJS watch mode
pnpm dev:client   # somente client, Next.js dev server
```

## Regras Globais

Estas regras se aplicam a QUALQUER tarefa em QUALQUER app:

1. **Fronteira de apps**: código de `apps/api/` nunca importa de `apps/client/` e vice-versa. Comunicação exclusivamente via API REST.
2. **TypeScript strict**: ativado em ambas as apps. Sem `any` implícito.
3. **Nomenclatura de arquivos**: `kebab-case` em todo o projeto, sem exceção.
4. **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
5. **Testes**: rodar testes da app afetada antes de considerar qualquer tarefa concluída.
6. **Idioma do código**: inglês (variáveis, funções, tipos). Conteúdo visível ao usuário: português.

## Documentação Detalhada

```
docs/
├── database.md          # Schema Drizzle, PostGIS, queries geoespaciais
├── api.md               # Endpoints REST, DTOs, validação
├── auth.md              # JWT, guards, regras de acesso
├── business-rules.md    # Limites por plano, expiração, moderação
├── payments.md          # Integração Asaas, webhooks, planos
├── caching.md           # Redis keys, TTLs, invalidação
├── queues.md            # BullMQ queues, processors
├── geo.md               # Cidades, coordenadas, raios, geocoding
├── testing.md           # Convenções de teste
├── infrastructure.md    # Docker, deploy, env vars, CI/CD
├── pwa.md               # Instalação, cache offline, segurança e rollout
└── plans/
    └── pwa-rollout.md   # Fases, critérios de aceite e rollback da PWA
```

Leia o doc relevante **antes** de trabalhar em um domínio específico. Não confie apenas no que está neste arquivo.
