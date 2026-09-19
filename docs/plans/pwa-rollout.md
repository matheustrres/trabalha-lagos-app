# Rollout da PWA

**Status:** implementação concluída; validação Playwright e dispositivos pendente.

## Fase 1 — Base e segurança

- [x] manifesto, shortcut, orientações livres e viewport com zoom;
- [x] ícones 192, 512, maskable e Apple Touch Icon;
- [x] feature flags desabilitadas por padrão;
- [x] headers restritivos de `/sw.js`;
- [x] documentação de cache e segurança.

## Fase 2 — Offline e atualização

- [x] fallback `/offline` e precache mínimo;
- [x] Network First apenas nas páginas públicas elegíveis;
- [x] bloqueio de rotas privadas, API, autorização e mutações;
- [x] limpeza de caches antigos;
- [x] aviso de atualização e protocolo `SKIP_WAITING`;
- [x] reporte de falhas ao Sentry.

## Fase 3 — Instalação

- [x] prompt Chromium e instrução iOS;
- [x] atraso de 30 segundos e dispensa por 30 dias;
- [x] remoção após `appinstalled`;
- [x] posição com safe area e flag independente.

## Fase 4 — Validação e produção

- [x] suíte Playwright e integração com CI adicionadas;
- [ ] executar `pnpm run test:pwa`;
- [ ] validar Chrome Android e Safari iOS em staging;
- [ ] validar portrait, landscape, zoom 200% e safe areas;
- [ ] validar atualização entre duas versões publicadas;
- [ ] habilitar PWA em produção sem convite por 24–48 horas;
- [ ] ativar convite após a janela de observação.

## Critérios de aceite

- `pnpm run lint`, `pnpm run build` e `pnpm run test:pwa` aprovados;
- manifesto e dimensões dos ícones válidos;
- worker controla a aplicação após reload;
- página pública visitada abre offline e rota não armazenada abre `/offline`;
- conteúdo autenticado e API não aparecem nos caches;
- instalação, dispensa e atualização exigem ação explícita;
- app funciona normalmente com as flags desabilitadas;
- detector de interface sem erros.

## Rollback

1. Definir as duas feature flags como `false`.
2. Publicar `apps/client/public/sw-rollback.js` como `/sw.js` se necessário.
3. Validar que não há registros nem caches `tl-pwa-*`.
4. Restaurar `public/sw.js` após corrigir e versionar o cache.
