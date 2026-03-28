# Cache (Redis) — TrabalhaLagos

## Padrão de key

`tl:<entidade>:<identificador>[:<variante>]`

## Keys

| Key | TTL | Invalidação |
|-----|-----|-------------|
| `tl:jobs:city:<slug>` | 5 min | Criar/editar/fechar vaga na cidade |
| `tl:jobs:count:category` | 10 min | Criar/fechar vaga |
| `tl:categories:all` | 1 hora | Alterar categorias (raro) |
| `tl:company:<id>:public` | 15 min | Editar perfil da empresa |
| `tl:geo:<address-hash>` | 24 horas | Nunca (resultado de geocoding) |

## Invalidação

Ao criar, editar ou fechar vaga: invalidar keys da cidade e categoria da vaga. Usar `SCAN` + `DEL` com pattern `tl:jobs:city:<slug-da-cidade>`.

## Rate Limiting

- Busca de vagas: 60 req/min por IP
- Demonstrar interesse: 10 req/min por usuário
- Publicar vaga: 5 req/min por empresa

Implementado via `@nestjs/throttler` com Redis store.