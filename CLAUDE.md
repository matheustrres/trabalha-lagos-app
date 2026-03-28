# CLAUDE.md — TrabalhaLagos

Plataforma de vagas de emprego hiperlocal para a Região dos Lagos (RJ). Busca geoespacial por raio em KM. Candidato usa grátis, empregador paga planos premium (R$29-49/mês).

## Estrutura do Monorepo

```
root/
├── apps/
│   ├── api/           # Backend — NestJS, Drizzle, PostgreSQL + PostGIS, Redis, BullMQ
│   └── client/        # Frontend — Next.js 15 (App Router), React 19, Tailwind CSS v4
└── docs/              # Documentação detalhada (progressive disclosure)
```

Cada app tem seu próprio `CLAUDE.md` com stack, comandos e regras específicas. **Leia o CLAUDE.md da app alvo antes de qualquer tarefa.**

## Comandos Globais

```bash
# Subir dependências de infra
cd apps/api && docker compose up -d                  # PostgreSQL (PostGIS) + Redis

# API (apps/api/)
cd apps/api && pnpm start:dev      # NestJS watch mode

# Client (apps/client/)
cd apps/client && pnpm dev         # Next.js dev server
```

## Regras Globais

Estas regras se aplicam a QUALQUER tarefa em QUALQUER app:

1. **Fronteira de apps**: código de `apps/api/` nunca importa de `apps/client/` e vice-versa. Comunicação exclusivamente via API REST.
2. **TypeScript strict**: ativado em ambas as apps. Sem `any` implícito.
3. **Nomenclatura de arquivos**: `kebab-case` em todo o projeto, sem exceção.
4. **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
5. **Testes**: rodar testes da app afetada antes de considerar qualquer tarefa concluída.
6. **Idioma do código**: inglês (variáveis, funções, tipos). Conteúdo visível ao usuário: português (via i18n).

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
└── infrastructure.md    # Docker, deploy, env vars, CI/CD
```

Leia o doc relevante **antes** de trabalhar em um domínio específico. Não confie apenas no que está neste arquivo.