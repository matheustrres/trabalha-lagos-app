# Integração Adzuna

## Objetivo e estado

Prova técnica para medir cobertura, duplicação e qualidade geográfica das vagas da Adzuna nas sete cidades atendidas pelo TrabalhaLagos.

Estado em 21/09/2026: **trial operacional, sem publicação de conteúdo Adzuna**. O código consulta e gera relatório local, mas não persiste dados da Adzuna nem agenda execução. A tabela `external_jobs` e o seed exclusivamente local permitem validar a busca pública com dados sintéticos sem utilizar conteúdo licenciado. Qualquer ativação comercial da fonte Adzuna depende de licença escrita.

## Evidência inicial

Em 19/09/2026 foi validado manualmente um `GET` autenticado no endpoint de busca brasileiro. A evidência foi registrada sem URL final, query string, `app_id`, `app_key` ou `adref`. Forma sanitizada da chamada:

```bash
curl --get 'https://api.adzuna.com/v1/api/jobs/br/search/1' \
  --data-urlencode 'app_id=[REDACTED]' \
  --data-urlencode 'app_key=[REDACTED]' \
  --data-urlencode 'where=Cabo Frio' \
  --data-urlencode 'distance=25' \
  --data-urlencode 'results_per_page=20' \
  --data-urlencode 'max_days_old=30' \
  --data-urlencode 'sort_by=date'
```

Foi observada a anomalia textual `Pavuna` acompanhada por coordenadas da Região dos Lagos. Por isso o trial preserva `location.display_name`, calcula a cidade mais próxima e reporta divergências.

## Contrato e limites conhecidos

- Endpoint: `GET /v1/api/jobs/br/search/{page}`.
- País: `br`; página fixa em `1`; ordenação por `date`.
- Parâmetros do trial: `where`, `distance`, `results_per_page` e `max_days_old`.
- Limites padrão conhecidos: 25 requisições/minuto, 250/dia, 1.000/semana e 2.500/mês. Confirmar no painel/contrato antes de automação.
- Trial conhecido: 14 dias. A disponibilidade técnica não concede direito de republicação ou monetização.
- Uma versão pública deverá exibir a atribuição visual **“Jobs by Adzuna”** conforme licença e termos vigentes.

Referências: [visão geral](https://developer.adzuna.com/overview), [busca](https://developer.adzuna.com/docs/search) e [termos de serviço](https://developer.adzuna.com/docs/terms_of_service).

## Arquitetura da prova

O módulo `apps/api/src/modules/external-jobs/integrations/adzuna/` contém:

1. `AdzunaService`: client Nest reutilizável com `HttpService`, timeout de 10 segundos, validação do payload e tipos internos;
2. `adzuna-geography.ts`: WGS84, bounding box regional, Haversine e divergência textual;
3. `AdzunaReportService`: no máximo uma consulta por cidade, deduplicação e relatório;
4. `adzuna-command.ts`: entrada operacional sem carregar banco, Redis, filas ou API pública.

Não há retry automático nem paginação adicional. Duplicatas exatas são consolidadas por `externalId`; agrupamentos por empresa + título + cidade mais próxima são apenas informativos.

## Configuração e execução

Variáveis opcionais na inicialização geral, obrigatórias para o comando:

```dotenv
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

```bash
pnpm --filter @trabalha-lagos/api adzuna:search
pnpm --filter @trabalha-lagos/api adzuna:search -- --city=cabo-frio
pnpm --filter @trabalha-lagos/api adzuna:search -- --distance=25 --results=20 --max-days-old=30
```

Defaults: sete cidades, página 1, 25 km, 20 resultados/cidade, 30 dias, `date`, `br`. O processo retorna `0` quando todas as consultas são válidas e `1` quando falta configuração, há argumento inválido ou alguma cidade falha. Falhas parciais ainda produzem JSON.

O relatório inclui configuração sanitizada, contadores de requisições, volume por cidade, totais bruto/único, duplicatas, cobertura de coordenadas, anomalias, distribuições e até três exemplos sem URLs por cidade.

## Segurança e troubleshooting

- Credenciais são enviadas somente em query parameters exigidos pela API e nunca entram no relatório ou nas mensagens de erro.
- Não registrar objetos Axios, configuração de request, URL completa, query string, URL de redirecionamento ou `adref`.
- `MISSING_CONFIGURATION`: definir as duas variáveis Adzuna.
- `UNAUTHORIZED`/`FORBIDDEN`: revisar credenciais, trial, plano e permissões.
- `RATE_LIMITED`: interromper novas execuções e conferir orçamento da cota; não adicionar retry.
- `TIMEOUT`: a chamada excedeu 10 segundos.
- `INVALID_RESPONSE`: contrato mínimo da resposta não foi atendido; preservar o payload apenas em investigação local segura.
- `UPSTREAM_ERROR`/`NETWORK_ERROR`: indisponibilidade remota ou de rede.

## Seed local sintético

Para validar persistência e preparar a futura API sem utilizar dados licenciados, a migration cria a tabela separada `external_jobs`. O comando abaixo insere ou atualiza 14 vagas fictícias — duas para cada cidade:

```bash
pnpm --filter @trabalha-lagos/api db:migrate
pnpm --filter @trabalha-lagos/api db:seed:external:local
```

O seed:

- usa `source = SYNTHETIC` e IDs determinísticos;
- é idempotente por `source + externalId`;
- usa somente URLs sob `https://example.invalid/`;
- contém texto explícito de que as vagas são fictícias;
- rejeita `NODE_ENV=production` e bancos fora de `localhost`, `127.0.0.1` ou `::1`;
- expõe somente esses registros sintéticos em desenvolvimento por `GET /jobs`, discriminados como `sourceType = EXTERNAL`; conteúdo Adzuna permanece excluído da consulta pública.

O endpoint combina vagas próprias (`sourceType = INTERNAL`) e sintéticas externas (`sourceType = EXTERNAL`) com ordenação e paginação comuns. A interface não cria página de detalhe nem JSON-LD para vagas externas: vagas reais futuras usarão o link sanitizado da origem, enquanto registros `SYNTHETIC` são exibidos sem link clicável.

Para inspecionar os dados após o seed:

```sql
SELECT source, city, count(*)
FROM external_jobs
GROUP BY source, city
ORDER BY city;
```

## Histórico de execuções

| Data | Tipo | Resultado |
|---|---|---|
| 19/09/2026 | CURL manual sanitizado | Endpoint brasileiro respondeu; observada anomalia `Pavuna`/coordenadas regionais. |
| 19/09/2026 | Suíte automatizada | Sem rede; transporte, normalização, geografia, deduplicação, relatório e códigos cobertos. |
| 19/09/2026 | Comando, sete cidades | 7/7 consultas concluídas; 140 registros brutos, 46 únicos, 29 IDs repetidos, 1 grupo heurístico, 100% com coordenadas e 1 divergência geográfica (`Pavuna` próxima a Cabo Frio). |

Adicionar aqui os totais das execuções reais relevantes, sem credenciais, URLs completas ou dados de query.

## Roadmap pós-licença

1. evoluir a tabela `external_jobs`, já criada para o seed sintético, sem tornar `jobs.companyId` anulável;
2. sincronizar por BullMQ com orçamento explícito de requisições;
3. persistir coordenadas e reaplicar o filtro com PostGIS;
4. expirar vagas não vistas e verificar links;
5. deduplicar contra vagas próprias;
6. substituir a restrição atual a `SYNTHETIC` por feature flag e allowlist de fontes licenciadas;
7. criar detalhe local `noindex`, inicialmente sem JSON-LD ou sitemap;
8. substituir “Tenho interesse” por CTA externo;
9. incluir atribuição visual obrigatória da Adzuna;
10. ativar por feature flag após validações jurídica, de qualidade e observabilidade.
