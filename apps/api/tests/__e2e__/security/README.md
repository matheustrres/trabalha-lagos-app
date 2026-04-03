# Security E2E — Rate Limiting

Este diretório contém cenários E2E focados em proteção anti-spam e validação de throttling.

## Arquivo principal

- `rate-limiting.e2e.spec.ts`

## Como rodar

```bash
pnpm test:e2e:throttle
```

## Cobertura atual (tracker esperado por rota)

| Rota | Limite esperado | Tracker esperado | Cenário coberto |
|---|---:|---|---|
| `POST /auth/login` | 5/min | IP (`x-forwarded-for` → `ip`) | Bloqueia na 6ª requisição com `429` |
| `POST /auth/register` | 3/min | IP (`x-forwarded-for` → `ip`) | Bloqueia na 4ª requisição com `429` |
| `GET /jobs` | 60/min | IP (`x-forwarded-for` → `ip`) | Bloqueia na 61ª requisição com `429` |
| `GET /categories` | 300/min | IP (`x-forwarded-for` → `ip`) | Permissiva em burst (80 requests com `200`) |
| `GET /employer/jobs` | 90/min | Usuário (`userId` / `sub`) | Mesmo usuário em IPs diferentes: continua no mesmo bucket e bloqueia |
| `GET /employer/jobs` | 90/min | Usuário (`userId` / `sub`) | Usuários diferentes no mesmo IP: buckets independentes |

## Notas de manutenção

- As rotas autenticadas devem ser validadas com tracker por usuário (`getUserTracker`).
- As rotas públicas devem ser validadas com tracker por IP (`getIpTracker`).
- A suíte de throttle usa storage em memória para estabilidade/isolamento dos testes.
- Para expandir cobertura, manter o padrão: **nome da rota + limite + tipo de tracker + resultado esperado**.
