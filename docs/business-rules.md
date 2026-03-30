# Regras de Negócio — TrabalhaLagos

## Planos

| Regra | FREE | PRO (R$29/mês) | SEASON (R$49/mês) |
|-------|------|----------------|---------------------|
| Vagas ativas simultâneas | 2 | 10 | Ilimitado |
| Expiração de vaga | 30 dias | 60 dias | 60 dias |
| Dados do candidato visíveis | Nome, cidade | Nome, telefone, cidade, interesses | Completo |
| Badge "Verificada" | Não | Sim | Sim |
| Vaga em destaque (`featured`) | Não | Não | Sim |
| Vaga urgente (`urgent`) | Não | Não | Sim |
| Dashboard de métricas | Não | Básico | Completo |
| Push para candidatos | Não | Não | Sim |

## Regras Críticas

1. **Limite de vagas**: validar em `JobsService.create()` ANTES de persistir. Contar vagas com `status = ACTIVE` da empresa.

2. **Interesse único**: constraint unique `[userId, jobId]`. Um candidato só demonstra interesse uma vez por vaga. Retornar 409 Conflict se duplicado.

3. **Dados por plano**: ao retornar interesses para o empregador, filtrar campos do candidato conforme plano. FREE vê apenas `name` e `city`. PRO+ vê `phone` também. Implementar no service, não no controller.

4. **featured/urgent**: apenas plano SEASON. Validar em `JobsService.create()` e `JobsService.update()`. Silenciosamente ignorar os flags se plano não permite (não retornar erro).

5. **Expiração automática**: BullMQ job roda a cada 1h, marca vagas com `expiresAt < NOW()` como `EXPIRED`. Ver `/trabalha-lagos/docs/queues.md`.

6. **Moderação**: MVP publica imediatamente. Admin pode remover via `PATCH /admin/jobs/:id`. Na v2, implementar fila de aprovação.

7. **Região**: vagas devem estar na Região dos Lagos. Validar coordenadas dentro do bounding box no service:
   - Latitude: -23.10 a -22.60
   - Longitude: -42.60 a -41.80
   Rejeitar com 400 se fora do range.

8. **Slug de vaga**: gerar automaticamente a partir do título + sufixo aleatório. Deve ser único. Ver `src/common/utils/slugify.ts`.