# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Candidatos que procuram oportunidades de trabalho na Região dos Lagos.
- Empregadores locais que precisam publicar vagas e encontrar candidatos.
- Os dois públicos têm prioridade equivalente nas decisões do produto.

## Product Purpose

Conectar candidatos a oportunidades de trabalho locais e empregadores a pessoas que procuram emprego na Região dos Lagos, RJ.

## Positioning

Plataforma hiperlocal de vagas para a Região dos Lagos, com busca por distância em quilômetros. Candidatos usam a plataforma gratuitamente; empregadores publicam vagas por planos pagos.

## Operating Context

- Candidatos mantêm uma conta de acesso e um perfil profissional separado, com WhatsApp pessoal, áreas de interesse, experiência resumida, disponibilidade, tipos de vínculo aceitos e bairro/região.
- Empregadores mantêm uma conta de acesso e um perfil de empresa separado para publicar vagas.
- A área `/perfil` é compartilhada para gerenciar dados da conta; candidatos também têm uma área separada para o perfil profissional.

## Capabilities and Constraints

- O foco geográfico do produto é a Região dos Lagos, RJ; a busca de vagas considera distância por raio.
- O candidato não paga para usar a plataforma. Empregadores usam planos pagos; limites e recursos variam por plano.
- A conta permite alterar nome, cidade e senha. Alterar o e-mail exige confirmação da senha atual.
- A exclusão da conta é permanente, confirmada pela senha e pela frase `EXCLUIR MINHA CONTA`.
- A plataforma é uma aplicação web implementada em monorepo com API REST e cliente Next.js.

## Brand Commitments

- Nome do produto: TrabalhaLagos.
- A interface e a comunicação com usuários são em português do Brasil.

## Evidence on Hand

As regras e capacidades do produto estão registradas em `docs/business-rules.md`, `docs/geo.md`, `docs/auth.md` e `docs/api.md`. Nenhum depoimento, estudo de caso ou métrica verificada foi indicado como evidência pública durante esta configuração.

## Product Principles

- Manter a relevância local como centro da descoberta de vagas.
- Atender candidatos e empregadores com prioridade equivalente.
- Manter gratuito o acesso do candidato e financiar a plataforma com planos para empregadores.
- Separar dados da conta de acesso dos dados de perfil profissional ou de empresa.
