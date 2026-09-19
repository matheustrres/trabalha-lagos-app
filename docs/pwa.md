# PWA do frontend

## Objetivo

O frontend é uma Progressive Web App mobile-first, instalável e resiliente a
falhas de rede. A primeira versão cobre instalação, atualização controlada,
abertura offline e leitura offline de páginas públicas elegíveis já visitadas.

Busca dinâmica, autenticação, perfil, interesses e painel do empregador são
sempre online. Push notifications não fazem parte desta entrega.

## Configuração

| Variável | Padrão | Função |
|---|---:|---|
| `NEXT_PUBLIC_PWA_ENABLED` | `false` | Registra o service worker em builds de produção |
| `NEXT_PUBLIC_PWA_INSTALL_PROMPT_ENABLED` | `false` | Exibe o convite contextual de instalação |

O service worker nunca é registrado por `next dev`. Quando a PWA é desabilitada,
o client remove registros e caches `tl-pwa-*` remanescentes.

## Suporte de navegadores

- Chromium Android: instalação pelo prompt nativo `beforeinstallprompt`.
- Safari iOS/iPadOS: instrução “Compartilhar → Adicionar à Tela de Início”.
- Navegadores sem Service Worker: aplicação online normal, sem bloqueio.

O manifesto não força orientação: portrait e landscape são suportados. A
viewport permite zoom do navegador.

## Política de cache

O arquivo `apps/client/public/sw.js` usa caches versionados:

- precache: `/offline`, os chunks estáticos referenciados por essa tela,
  manifesto, Apple Touch Icon e ícones PWA;
- Cache First: `/_next/static/**` e `/icons/**`;
- Network First com fallback em cache: `/`, `/vaga/[slug]` e
  `/vagas/[cidade]`;
- somente rede com fallback `/offline`: `/vagas`, sem armazenar resultados.

Não são interceptados nem armazenados:

- métodos diferentes de `GET`;
- requisições com `Authorization`;
- `/login`, `/cadastro`, `/perfil` e `/painel/**`;
- `/api/**`, origens externas e respostas JSON da API.

No evento `activate`, caches `tl-pwa-*` de versões anteriores são removidos.
Para invalidar conteúdo, altere `CACHE_VERSION` em `public/sw.js`.

## Segurança

`/sw.js` é entregue com:

```text
Cache-Control: no-cache, no-store, must-revalidate
Content-Type: application/javascript; charset=utf-8
Content-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'
Service-Worker-Allowed: /
```

Conteúdo autenticado permanece fora do cache. Não adicionar rotas privadas à
função `isPublicCacheablePage`.

## Instalação

O convite aparece apenas depois de 30 segundos, em páginas públicas elegíveis,
quando o app não está instalado. Ao dispensar, fica oculto por 30 dias.

Chaves locais:

- `tl:pwa-install-dismissed-at` — timestamp da dispensa;
- `tl:pwa-installed` — instalação confirmada.

O banner fica acima da navegação inferior e respeita a safe area do aparelho.

## Atualização

Um worker novo permanece em espera. A interface mostra “Nova versão disponível”
e, após ação do usuário, envia `{ "type": "SKIP_WAITING" }`. O app recarrega uma
única vez após `controllerchange`. Falhas são reportadas ao Sentry sem bloquear.

## Rollout e rollback

1. Habilitar `NEXT_PUBLIC_PWA_ENABLED=true` em staging.
2. Validar instalação, atualização, cache e offline em Android/iOS.
3. Habilitar a PWA em produção mantendo
   `NEXT_PUBLIC_PWA_INSTALL_PROMPT_ENABLED=false` por 24–48 horas.
4. Habilitar o convite após confirmar estabilidade.

Rollback:

1. definir as duas flags como `false`;
2. se uma versão defeituosa ainda controlar clientes, publicar temporariamente
   `public/sw-rollback.js` como `/sw.js`;
3. confirmar remoção dos caches e do registro antes de restaurar o worker normal.

## Troubleshooting

- Worker não registra: confirmar HTTPS (ou localhost), flag e build de produção.
- Alteração não chega: verificar o header de `/sw.js` e aumentar `CACHE_VERSION`.
- Página não abre offline: ela precisa ter sido visitada por navegação completa e
  estar entre as rotas públicas elegíveis.
- Convite não aparece: confirmar a segunda flag, aguardar 30 segundos, limpar as
  chaves locais e verificar se o app já é considerado instalado.
- Estado inconsistente: DevTools → Application → Storage → Clear site data.

## Futuro: push notifications

Push fica fora da v1. Uma fase posterior deve definir consentimento, preferências,
VAPID, persistência, expiração, revogação e integração backend. Nenhuma permissão
de notificação é solicitada nesta entrega.
