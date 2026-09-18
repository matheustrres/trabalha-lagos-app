Resumo executivo (direto ao ponto)
Estado atual: o produto já está bem avançado para um MVP funcional de vagas hiperlocal (cadastro/login, publicação e busca geoespacial, interesse candidato→vaga, painel do empregador, perfil do candidato).
Recomendação:

- ✅ Go para beta em produção (tráfego real controlado, validação de aquisição/uso, sem foco em monetização imediata).
- ⚠️ No-Go para “MVP comercial completo” (com cobrança/plano premium), porque o eixo de pagamentos/upgrade ainda não está implementado no código atual.

---

1. O que já está implementado de fato
   Backend (NestJS + Drizzle + PostGIS + Redis)
   Módulos implementados e ativos:

- auth
- users
- companies
- jobs
- interests
- categories
  Principais endpoints ativos
- Auth: POST /auth/register, POST /auth/login, POST /auth/refresh
- Vagas: GET /jobs, GET /jobs/:slug, POST /jobs, PATCH /jobs/:id, PATCH /jobs/:id/status, GET /employer/jobs
- Interesses: POST /jobs/:jobId/interest, GET /employer/interests, PATCH /interests/:id/status
- Categorias: GET /categories
- Empresas: GET /companies/me, GET /companies/:id, PATCH /companies/:id
- Perfil candidato: GET /users/me/profile, PATCH /users/me/profile
  Regras de negócio já aplicadas no código
- Limite de vagas por plano (FREE=2, PRO=10, SEASON=ilimitado)
- Expiração por plano na criação da vaga (30/60 dias)
- featured/urgent só efetivo para SEASON
- Bounding box da Região dos Lagos para coordenadas
- Busca por raio com PostGIS (ST_DWithin + ST_Distance)
- Unicidade de interesse:
  - por userId+jobId (logado)
  - por phone+jobId (anônimo)
- Rate limiting global e por rota com Redis
- Contador de views com flush em cron (Redis → DB)

---

Frontend (Next 15 + React 19 + App Router)
Rotas públicas prontas

- Home (/)
- Busca de vagas (/vagas)
- Landing por cidade com SSG+ISR (/vagas/[cidade])
- Detalhe de vaga SSR + JSON-LD (/vaga/[slug])
- Login/Cadastro (/login, /cadastro)
  Rotas autenticadas prontas
- Painel empregador (/painel, /painel/vagas, /painel/nova-vaga, /painel/interesses)
- Perfil candidato (/perfil)
  Funcionalidades UX já presentes
- SEO base (metadata, sitemap, robots, JSON-LD em vaga)
- PWA base (manifest + ícones)
- Filtros de busca (raio, categoria, tipo, cidade)
- Compartilhamento com cópia de link da vaga + feedback visual
- Fechamento de filtros por clique fora
- Distância formatada (sem float “quebrado”)
- Link de categoria na home abrindo com radius=100 para consistência regional

---

2. Qualidade e validação que rodei agora
   Executei os comandos:

- apps/client: pnpm lint ✅
- apps/client: pnpm build ✅
- apps/api: pnpm test:unit ✅
  - 23 arquivos de teste, 160 testes passando
- apps/api: pnpm test:e2e ✅
  - 11 arquivos de teste, 45 testes passando
    Leitura técnica: backend está com boa cobertura de fluxo core (inclusive e2e com Testcontainers e testes de rate limit).

---

3. Gaps importantes para “MVP comercial” (com cobrança)
   Embora a docs mencionem payments, notifications, geo, admin, esses módulos não estão presentes em apps/api/src/modules atualmente.
   Não implementado (ou parcial) no código atual

1) Pagamentos/upgrade de plano (Asaas): não há módulo/rotas ativas.
2) Notificações: não há módulo.
3) Admin/moderação: não há módulo.
4) Área “Empresas” no app cliente: item existe no bottom nav, mas está desabilitado (href: null).
5) Testes de frontend: não há suíte de testes (spec/test) no client.
6) CI/CD versionado no repo: não encontrei workflows em .github/workflows.

---

4. Riscos de produção (prioridade alta)

1) Autenticação no client usa localStorage para access+refresh token
   - funcional, mas mais sensível a XSS do que cookie httpOnly.
2) Refresh token por payload no body, não por cookie seguro.
3) CORS da API está hardcoded em main.ts para localhost (3000/3001)
   - precisa parametrizar por ambiente antes de produção real.
4) Documentação com divergências:
   - docs/testing.md está com conteúdo de infraestrutura (duplicado/rotulado incorretamente).
   - docs mencionam guard de plano e módulos que ainda não existem.
5) Sem trilha de observabilidade/alerta pronta no código/versionamento (Sentry/GA/uptime citados em docs, mas sem evidência de integração no repo).

---

5. Em que pé estamos do MVP
   Se o MVP for “validar demanda e uso do produto”
   Status: ~80-85% pronto  
   Você já consegue rodar operação real de:

- atração de candidato
- descoberta de vaga
- interesse em vaga
- operação de empregador com publicação/gestão
  Se o MVP for “produto comercial com planos pagos”
  Status: ~55-65% pronto  
  Falta principalmente:
- checkout + webhook + ciclo de assinatura
- estratégia de upgrade/downgrade real
- governança/observabilidade/rotinas operacionais

---

6. Recomendação de lançamento
   Recomendação prática

- Lançar em produção como Beta MVP funcional (sem cobrança obrigatória): SIM
- Lançar já como MVP pago/comercial completo: NÃO ainda
  Checklist mínimo antes de abrir para público amplo

1. Parametrizar CORS por ambiente e validar secrets.
2. Definir estratégia de token (ideal: refresh em cookie httpOnly + hardening).
3. Subir CI básico (lint + unit + e2e API + build client).
4. Integrar observabilidade mínima (Sentry + uptime + logs centralizados).
5. Fechar escopo comercial: implementar pagamentos/planos ou assumir fase gratuita explicitamente.

---
