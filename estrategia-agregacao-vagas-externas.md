# Estratégia de agregação de vagas externas

## Resultado

A melhor estratégia para o TrabalhaLagos é um modelo híbrido:

1. vagas próprias continuam sendo o produto principal;
2. vagas externas entram por APIs/licenças, feeds autorizados e integrações com páginas de carreira;
3. LinkedIn, Indeed e Glassdoor não devem ser raspados diretamente;
4. toda vaga externa deve ser normalizada, geocodificada, deduplicada, monitorada e claramente identificada;
5. o candidato é redirecionado à fonte original para concluir a candidatura.

A prioridade inicial deve ser cobrir empresas e fontes da Região dos Lagos, não tentar replicar todo o catálogo nacional.

## 1. Opções disponíveis

| Estratégia | Velocidade | Controle | Risco jurídico | Recomendação |
|---|---:|---:|---:|---|
| APIs de agregadores, como Jooble/Adzuna | Alta | Médio | Baixo/médio | Melhor para MVP |
| Feeds diretos de empresas locais | Média | Alto | Baixo | Estratégia principal |
| APIs públicas de ATS | Média | Alto | Baixo/médio | Excelente complemento |
| Integração com parceiros oficiais | Baixa | Alto | Baixo | Médio/longo prazo |
| Importação CSV/XML/RSS | Média | Alto | Baixo | Muito útil para parceiros |
| Curadoria manual de links | Alta | Baixo | Baixo/médio | Boa para validar demanda |
| Scraping autorizado de páginas de carreira | Média | Médio | Médio | Somente com autorização |
| Scraping de LinkedIn/Indeed/Glassdoor | Alta inicialmente | Baixo | Alto | Não recomendado |

## 2. APIs de agregadores de vagas

Em vez de integrar individualmente com dezenas de sites, podemos contratar ou aderir a uma API que já agrega vagas.

### Candidatos

- Jooble;
- Adzuna;
- provedores B2B de job feeds;
- distribuidores nacionais que ofereçam licenciamento ou parceria.

A [API do Jooble](https://jooble.org/api/about) permite pesquisar vagas agregadas da internet. É necessário confirmar se a chave e o contrato oferecem cobertura adequada para o Brasil.

A [API da Adzuna](https://developer.adzuna.com/) oferece pesquisa por localização e palavras-chave, inclusive com dados padronizados. Também precisamos validar cobertura real nas cidades da Região dos Lagos, pois disponibilidade técnica não garante volume local.

O trial e suas regras operacionais estão documentados em [Integração Adzuna](docs/adzuna-integration.md).

### Vantagens

- implementação relativamente rápida;
- uma integração entrega diversas fontes;
- estrutura de dados mais previsível;
- contrato tende a esclarecer exibição, atribuição e redirecionamento;
- menor manutenção do que dezenas de scrapers.

### Limitações

- pode haver pouco inventário hiperlocal;
- descrições podem vir incompletas;
- restrições sobre cache, monetização e mistura com outras fontes;
- dependência comercial;
- resultados duplicados entre provedores.

### Recomendação

Fazer um piloto antes de contratar:

1. pesquisar as cidades da área de cobertura;
2. medir quantidade de vagas realmente ativas;
3. medir duplicação;
4. verificar precisão da localização;
5. avaliar custo por requisição, clique ou vaga;
6. revisar direitos de armazenamento, exibição e monetização.

## 3. Feeds diretos de empresas locais

Esta é a estratégia com maior aderência ao posicionamento do TrabalhaLagos.

O produto pode oferecer às empresas:

- endpoint REST para envio de vagas;
- feed XML ou JSON;
- upload de CSV;
- integração com webhook;
- importação recorrente de uma página de carreira autorizada;
- painel simples de “importar vaga por URL”.

### Parceiros-alvo

- hotéis e pousadas;
- restaurantes e redes de alimentação;
- supermercados;
- hospitais e clínicas;
- comércio e shopping centers;
- empresas de turismo;
- escolas e faculdades;
- construção civil;
- prefeituras e entidades locais, quando houver fonte reutilizável;
- agências de RH da região;
- associações comerciais;
- CDL;
- sindicatos patronais;
- grupos empresariais locais.

### Proposta comercial

A empresa autoriza o TrabalhaLagos a importar as vagas e recebe:

- distribuição hiperlocal;
- tráfego qualificado;
- painel de cliques;
- marca verificada;
- destaque opcional pago;
- atualização automática;
- encerramento sincronizado.

Isso cria uma relação direta com a fonte e pode posteriormente converter o parceiro para um plano premium.

## 4. Integração com sistemas ATS

Muitas empresas publicam vagas em sistemas de recrutamento que já oferecem endpoints públicos ou feeds.

Exemplos:

- Greenhouse;
- Lever;
- Ashby;
- Workable;
- Gupy e outros ATS nacionais, mediante parceria ou autorização;
- páginas próprias com `JobPosting` em JSON-LD.

A [Job Board API do Greenhouse](https://docs.greenhouse.io/job-board.html) disponibiliza vagas públicas em JSON sem autenticação nos endpoints de leitura. A [Postings API do Lever](https://github.com/lever/postings-api) também expõe vagas publicadas por empresa.

### Como aplicar no TrabalhaLagos

Não tentar importar todas as empresas existentes nesses ATS. Manter um catálogo explícito:

```text
Empresa parceira
  └── Tipo de integração: Greenhouse
      └── Board token
          └── Vagas públicas
```

Cada empresa deve ter:

- fonte;
- autorização ou base contratual;
- identificador do board;
- cidades de interesse;
- frequência de sincronização;
- contato responsável;
- política de expiração.

### Atenção

Uma API publicamente acessível não significa automaticamente liberdade irrestrita para copiar, armazenar ou monetizar o conteúdo. Termos do ATS e autorização do empregador ainda devem ser analisados.

## 5. LinkedIn, Indeed e Glassdoor

### LinkedIn

Não recomendo scraping.

O contrato do LinkedIn proíbe crawlers, bots, cópia automatizada, redistribuição de conteúdo e determinados tipos de deep link sem consentimento. Também restringe conteúdo obtido indiretamente por agregadores. Consulte o [User Agreement do LinkedIn](https://www.linkedin.com/legal/user-agreement) e os [termos das APIs](https://www.linkedin.com/legal/l/api-terms-of-use).

As APIs de vagas encontradas na documentação oficial são voltadas principalmente a parceiros aprovados que enviam e gerenciam vagas no LinkedIn, não a baixar o catálogo de vagas para montar outro agregador. O acesso exige aprovação e acordo específico, conforme a [documentação do Job Posting API](https://learn.microsoft.com/en-us/linkedin/talent/apply-connect/create-apply-connect-jobs).

Estratégias possíveis:

- solicitar entrada no programa de parceiros;
- permitir que empresas do TrabalhaLagos distribuam suas vagas para o LinkedIn;
- aceitar links enviados pelo próprio empregador;
- negociar licenciamento específico.

Não assumir que a API de publicação permitirá importar vagas do LinkedIn.

### Indeed

O Indeed possui APIs e programa de parceiros, mas grande parte das integrações é voltada a ATS, publicação e sincronização de candidaturas. A documentação informa que credenciais e recursos dependem de acesso provisionado pelo programa de parceiros: [Indeed Partner Docs](https://docs.indeed.com/).

Existe também um plugin de busca para publishers, mas seus termos impõem condições de marca, exibição, monetização e proíbem complementar o conteúdo do plugin com dados raspados do Indeed. Consulte os [termos do plugin](https://docs.indeed.com/legal-terms/plugin-terms).

Caminhos aceitáveis:

- solicitar parceria como publisher;
- testar o plugin oficial, se disponível para o mercado brasileiro;
- negociar API/feed licenciado;
- receber as vagas diretamente das empresas que também as publicam no Indeed.

### Glassdoor

Os termos do Glassdoor proíbem agentes automatizados, scraping, mineração, framing e deep links não autorizados. Consulte os [termos do Glassdoor](https://www.glassdoor.com/about/terms-2022-12-01/).

Existe documentação de API, mas acesso e permissões precisam ser negociados. Não devemos interpretar a existência da API como autorização genérica para agregar todas as vagas.

### Conclusão sobre as três plataformas

Não construir o negócio dependendo de scraping dessas fontes. Além do risco contratual:

- bloqueios e CAPTCHAs quebram a operação;
- mudanças de HTML exigem manutenção contínua;
- contas e IPs podem ser bloqueados;
- vagas desaparecem sem aviso;
- descrições e links podem ficar desatualizados;
- a empresa fica exposta a notificações de remoção e alegações de uso indevido.

## 6. Coleta autorizada de páginas de carreira

Para empresas que não possuem API, podemos oferecer um conector autorizado.

### Formas de leitura

Ordem preferencial:

1. feed XML/JSON fornecido pela empresa;
2. JSON-LD `JobPosting`;
3. sitemap específico de vagas;
4. API interna documentada/autorizada;
5. parsing do HTML como último recurso.

O Google documenta o padrão `JobPosting`, incluindo localização, `validThrough` e regras para vagas expiradas: [Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/job-posting).

### Contrato simples de autorização

Deve definir:

- autorização para acessar e republicar;
- quais campos podem ser armazenados;
- uso da marca e logotipo;
- frequência das consultas;
- atribuição da fonte;
- responsabilidade pelo conteúdo;
- tratamento de expiração;
- canal de correção e remoção;
- possibilidade de monetização;
- duração e encerramento da autorização.

## 7. Curadoria de links como MVP

Antes de construir conectores complexos, o TrabalhaLagos pode validar a experiência com vagas externas curadas.

Um administrador cadastra:

- título;
- empresa;
- cidade;
- modalidade;
- resumo curto;
- URL original;
- fonte;
- data de descoberta;
- data provável de expiração.

O conteúdo exibido deve ser factual e limitado. Evitar copiar integralmente descrições quando não houver licença.

### Vantagens

- valida rapidamente se vagas externas aumentam retenção;
- ajuda a descobrir as melhores fontes locais;
- permite observar duplicatas e qualidade;
- reduz investimento prematuro em integrações.

### Limitação

Não escala sem automação e processo editorial.

## 8. Pipeline técnico recomendado

```text
Fontes autorizadas
    ↓
Conectores por fonte
    ↓
Armazenamento bruto temporário
    ↓
Normalização
    ↓
Geocodificação e validação regional
    ↓
Deduplicação
    ↓
Moderação e antifraude
    ↓
Índice de busca
    ↓
Exibição + redirecionamento à fonte
    ↓
Verificação recorrente de disponibilidade
```

### Modelo mínimo de uma vaga externa

```ts
type ExternalJob = {
  source: string;
  sourceJobId: string;
  sourceUrl: string;
  sourceCompanyId?: string;

  title: string;
  companyName: string;
  descriptionExcerpt?: string;

  locationText: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  locationConfidence: number;

  workplaceType: "onsite" | "hybrid" | "remote" | "unknown";
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;

  publishedAt?: Date;
  validThrough?: Date;
  lastSeenAt: Date;

  status: "pending" | "active" | "expired" | "removed";
  attributionLabel: string;
};
```

Não misturar esse registro diretamente com a entidade de vaga própria sem preservar claramente:

- origem;
- proprietário;
- regras de edição;
- forma de candidatura;
- ciclo de vida;
- atribuição;
- métricas.

Uma abordagem adequada é um modelo comum de busca com subtipos `INTERNAL` e `EXTERNAL`.

## 9. Geolocalização hiperlocal

Esse é o diferencial do TrabalhaLagos e também o maior problema de qualidade das fontes externas.

Vagas podem vir como:

- “Região dos Lagos”;
- “Cabo Frio e região”;
- “RJ”;
- endereço completo;
- cidade incorreta;
- trabalho remoto com sede em outra cidade;
- várias localidades no mesmo anúncio.

### Processo recomendado

1. normalizar município e UF;
2. procurar endereço estruturado;
3. geocodificar;
4. atribuir um nível de confiança;
5. rejeitar ou mandar para revisão quando a localização for ambígua;
6. separar `jobLocation` de `hiringOrganizationLocation`;
7. tratar remoto separadamente da busca por raio.

### Níveis de confiança

- `1.0`: coordenadas fornecidas pela fonte;
- `0.9`: endereço completo geocodificado;
- `0.7`: centroide do município;
- `0.4`: apenas “Região dos Lagos”;
- `0.0`: localização desconhecida.

Vagas com centroide municipal podem participar da busca por raio, mas a interface deve indicar “localização aproximada”.

A lista oficial de municípios atendidos deve ser configurável. Isso evita incorporar silenciosamente diferentes definições administrativas de “Região dos Lagos”.

## 10. Deduplicação

A mesma vaga provavelmente aparecerá no site da empresa, LinkedIn, Indeed, Glassdoor e em um agregador.

### Chaves de comparação

- ID fornecido pela fonte;
- URL canônica;
- empresa normalizada;
- título normalizado;
- município;
- hash da descrição;
- data de publicação;
- modalidade;
- faixa salarial.

### Regra de precedência sugerida

1. vaga própria do TrabalhaLagos;
2. feed direto e autorizado pelo empregador;
3. API do ATS do empregador;
4. agregador licenciado;
5. link curado manualmente.

Quando duas fontes representarem a mesma vaga, mostrar um único resultado. A vaga própria nunca deve perder destaque ou ser substituída por uma cópia externa.

## 11. Expiração e qualidade

Vagas externas envelhecidas prejudicam muito a confiança.

### Política inicial

- sincronização a cada 6–24 horas, conforme fonte;
- se a vaga deixa de aparecer, marcar como `missing`;
- confirmar ausência em duas ou três sincronizações;
- expirar imediatamente em caso de `404`, `410` ou status explícito;
- usar `validThrough` quando disponível;
- expirar preventivamente após 30 dias sem confirmação;
- manter tombstone para evitar reimportação indevida;
- oferecer botão “vaga encerrada ou suspeita”.

### Indicadores de qualidade

Cada vaga pode receber um `qualityScore` calculado por:

- fonte confiável;
- data recente;
- localização precisa;
- empresa identificada;
- salário informado;
- descrição completa;
- link funcionando;
- baixa probabilidade de fraude;
- ausência de duplicatas.

## 12. Experiência do candidato

A interface precisa distinguir claramente:

- “Vaga publicada no TrabalhaLagos”;
- “Vaga externa — candidatura no site da empresa”;
- nome da fonte;
- data da última verificação;
- localização aproximada, quando aplicável.

### Candidatura

No início, o melhor fluxo é:

1. candidato abre a vaga;
2. TrabalhaLagos registra o clique;
3. exibe aviso de redirecionamento;
4. abre a URL original;
5. não coleta currículo nem dados da candidatura externa.

Isso reduz complexidade de LGPD e evita criar um fluxo quebrado de candidatura intermediada.

## 13. Monetização sem prejudicar vagas próprias

Vagas externas devem aumentar aquisição e retenção, não destruir o incentivo para o empregador pagar.

### Possibilidades

- vagas próprias aparecem antes das externas;
- candidatura direta e simples somente nas vagas próprias;
- selo de empresa verificada;
- destaque patrocinado;
- métricas completas apenas para clientes;
- vaga externa pode ser “reivindicada” pelo empregador;
- convite para transformar uma vaga importada em vaga oficial;
- páginas de empresa com CTA para assumir o perfil;
- alertas e recomendações incluem ambos os tipos, com preferência configurável.

### Funil de aquisição B2B

```text
Vaga externa detectada
    ↓
Empresa recebe tráfego do TrabalhaLagos
    ↓
Empresa reivindica o perfil
    ↓
Converte a vaga para publicação oficial
    ↓
Contrata plano premium
```

## 14. Aspectos jurídicos e LGPD

Vagas normalmente são informações públicas, mas “público” não significa “livre para qualquer reutilização”.

É necessário revisar:

- termos de uso da fonte;
- direitos sobre descrição, logotipo e banco de dados;
- permissão para armazenamento e republicação;
- regras de atribuição;
- proibição de scraping;
- regras de deep link;
- prazo de retenção;
- mecanismo de remoção;
- eventual presença de nome, telefone ou e-mail de pessoa física.

### Política operacional necessária

- página explicando a agregação;
- identificação da fonte;
- canal de `notice and takedown`;
- remoção rápida;
- lista interna de fontes permitidas;
- registro da base de autorização de cada fonte;
- não importar dados de candidatos;
- evitar exibir contato pessoal de recrutadores;
- revisão jurídica dos contratos e fontes antes da produção.

Isto não substitui parecer jurídico específico.

## 15. Roadmap recomendado

### Fase 1 — validar, com baixo risco

1. cadastrar manualmente vagas externas de 10–20 fontes locais;
2. distinguir vagas próprias e externas;
3. implementar redirecionamento e métricas de clique;
4. implementar expiração e denúncia;
5. medir procura por cidade, profissão e raio.

### Fase 2 — automatizar fontes autorizadas

1. criar modelo de `ExternalJobSource`;
2. implementar importação CSV/XML/JSON;
3. criar conectores para parceiros locais;
4. integrar uma API agregadora em piloto;
5. implementar geocodificação, confiança e deduplicação;
6. criar painel operacional para erros e revisão.

### Fase 3 — conectar ATS e ampliar cobertura

1. Greenhouse;
2. Lever;
3. outros ATS conforme empresas-alvo;
4. leitura autorizada de JSON-LD;
5. sistema de reivindicação de empresa e vaga.

### Fase 4 — parcerias estratégicas

1. solicitar programas oficiais de Indeed e LinkedIn;
2. negociar distribuidores nacionais;
3. integrar associações empresariais;
4. oferecer API do TrabalhaLagos para parceiros;
5. permitir distribuição das vagas próprias para outros portais.

## Recomendação final

Eu adotaria esta ordem:

1. **Parcerias e feeds diretos de empregadores locais** — melhor qualidade e maior valor estratégico.
2. **API agregadora licenciada** — aumenta rapidamente o inventário enquanto o canal direto cresce.
3. **APIs públicas de ATS, por empresa e com autorização** — boa qualidade e baixo custo operacional.
4. **Curadoria manual** — útil para fontes pequenas e para validar novas integrações.
5. **Programas oficiais de LinkedIn, Indeed e Glassdoor** — perseguir no médio prazo, sem depender deles.
6. **Não realizar scraping direto dessas três plataformas**.

O ativo defensável não será “ter mais vagas que o LinkedIn”. Será oferecer a melhor seleção para quem mora ou quer trabalhar na Região dos Lagos: localização precisa, distância real, frescor, remoção de duplicatas, confiabilidade e relacionamento direto com empregadores locais.
