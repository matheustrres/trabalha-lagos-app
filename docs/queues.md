# Filas (BullMQ) — TrabalhaLagos

## Queues

| Queue | Tipo | Descrição |
|-------|------|-----------|
| `job-expiration` | Cron (1h) | Marca vagas com `expiresAt < NOW()` como EXPIRED |
| `notifications` | Event-driven | Email/push quando candidato demonstra interesse |
| `view-counter` | Cron local (5 min) | Batch update de contadores de visualização; ainda não usa BullMQ |
| `sitemap` | Cron (24h) | Regenera sitemap.xml para SEO |

## Padrão

Cada queue tem um processor em `src/modules/<modulo>/processors/`. Processors são `@Injectable()` e usam DI normalmente.

```typescript
@Processor('job-expiration')
export class JobExpirationProcessor extends WorkerHost {
  async process(job: Job) {
    // Buscar vagas ACTIVE com expiresAt < NOW()
    // Atualizar status para EXPIRED em batch
    // Invalidar cache das cidades afetadas
  }
}
```

## Conexão

BullMQ deverá conectar ao mesmo Redis da aplicação quando as filas forem ativadas. A configuração e o registro das filas ainda não fazem parte da implementação atual.
