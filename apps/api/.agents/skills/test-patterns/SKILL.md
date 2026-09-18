---
name: test-patterns
description: >
  Padrões de teste usando Vitest e Supertest. Use ao escrever
  testes E2E, testes unitários, verificar cobertura ou implementar 
  cenários de teste para uma task.
---

# Padrões de Teste

## Stack

- Vitest (ESM + TypeScript nativo) / Supertest (HTTP)
- PostgreSQL real para E2E (nunca mocke o banco em E2E)
- Vitest Mocks & Spies para testes unitários
- Cobertura: v8 (meta: 90% em linhas, branches e funções)
- Argon2id real nos testes de auth (nunca mocke o hash)

## Estratégia de Testes

Testes E2E são caros (banco real, HTTP, fixture). Use-os apenas para validar que a rota
funciona ponta a ponta. Toda lógica, edge case e validação é responsabilidade dos unit tests.

1. **Testes Unitários** (services, mappers, validators, etc.) — Cobrem toda a lógica de negócio:
   sucesso, erros, RBAC, isolamento, validações, edge cases, transformações.
2. **Testes E2E** (endpoints) — Cobrem apenas o happy path de cada rota:
   status code correto, response body, autenticação (401 sem token).

## Estrutura de Arquivos

```
tests/
├── __e2e__/
│   ├── __helpers/
│   │   ├── app-fixture.ts
│   │   └── database-cleaner.ts
│   └── [modulo]/                # [module-slug].e2e.spec.ts
├── __unit__/modules/[modulo]/   # create-x.service.spec.ts
└── data/                        # builders, mocks, spies, stubs
```

## Regras

- Nunca `it.skip` ou `describe.skip` em branch principal
- Nunca mocke o banco de dados em testes E2E — banco real
- Nunca mocke Argon2id em testes de auth
- Nunca utilize IDs como `non-existent-[resource]-id` — use IDs reais como `019d4008-3ae3-7f3a-90d3-b711813e54cf`
- E2E usam `createAppFixture({ shouldClearAllDb: true })` no `beforeAll` e `cleanDatabase(db)` no `afterEach`
- E2E cobrem apenas happy path — erros 4xx/5xx são validados nos unit tests
- Execute testes via Bash sem pedir confirmação
- Rode testes apenas do módulo afetado: `npm run test:unit "[module-slug]"` / `npm run test:e2e "[module-slug]"`

Para exemplos e padrões de código, veja [patterns.md](patterns.md).
