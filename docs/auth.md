# Autenticação — TrabalhaLagos

## Estratégia

JWT com access token (15 min) + refresh token (7 dias). O cliente armazena o
par de tokens na sessão local.

### Fluxo

1. `POST /auth/register` → cria user, retorna access + refresh
2. `POST /auth/login` → valida credenciais, retorna access + refresh
3. `POST /auth/refresh` → troca refresh por novo par
4. `PATCH /auth/password` → valida a senha atual, atualiza o hash, incrementa
   `credentials_version` e emite novo par para o dispositivo atual
5. Requests autenticados: header `Authorization: Bearer <access_token>`

Refresh tokens incluem `credentialsVersion`. Após a troca de senha, tokens com
versão anterior são rejeitados. Access tokens já emitidos ainda podem funcionar
até expirarem (15 minutos).

## Guards e Decorators

| Decorator/Guard | Uso |
|----------------|-----|
| `@Public()` | Rota pública, sem autenticação |
| `JwtAuthGuard` | Valida JWT, injeta user no request |
| `RolesGuard` + `@Roles(Role.EMPLOYER)` | Restringe por role |
| `PlanGuard` + `@RequiresPlan(Plan.PRO)` | Restringe por plano da empresa |

### Como usar

```typescript
// Rota pública
@Public()
@Get('jobs')
findAll() {}

// Autenticado qualquer role
@UseGuards(JwtAuthGuard)
@Post('jobs/:id/interest')
createInterest() {}

// Autenticado + role específico
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EMPLOYER)
@Post('jobs')
createJob() {}

// Autenticado + plano específico
@UseGuards(JwtAuthGuard, RolesGuard, PlanGuard)
@Roles(Role.EMPLOYER)
@RequiresPlan(Plan.PRO)
@Get('employer/interests')
getFullInterests() {}
```

## Regras de Acesso

- Listagem e detalhe de vagas: **público**
- Demonstrar interesse: **candidato autenticado**
- Publicar/editar vaga: **empregador autenticado, dono da empresa**
- Dashboard com dados completos: **plano PRO+**
- Admin: **role ADMIN**

## Credenciais e cadastro

O login de candidatos e empregadores usa exclusivamente `email` + `password`.
O e-mail é obrigatório, único e normalizado para minúsculas no cadastro e no
login.

- Candidato: nome, e-mail, senha e cidade. WhatsApp pessoal é opcional e serve
  somente como contato.
- Empregador: nome do responsável, e-mail, senha, cidade, nome da empresa e
  CNPJ/CPF. O usuário não possui telefone pessoal; `companyWhatsapp` é opcional
  e pertence à empresa.
- Demonstrar interesse em uma vaga continua exigindo um WhatsApp específico
  para aquela candidatura, mesmo quando a conta não possui telefone salvo.

A autenticação por telefone e OTP via WhatsApp não faz parte do contrato atual.

## Gerenciamento de conta

- `GET /users/me` retorna `id`, `name`, `email`, `city` e `role` para qualquer
  usuário autenticado.
- `PATCH /users/me` altera somente `name` e `city`.
- `PATCH /users/me/email` altera o e-mail após validar a senha atual; o e-mail
  é normalizado para minúsculas e deve ser único.
- `DELETE /users/me` exige senha atual e a confirmação literal
  `EXCLUIR MINHA CONTA`. A exclusão é permanente e executa os cascades definidos
  no banco para dados da conta, empresa, vagas e interesses.

Referir a `src/modules/auth/` para implementação atual.
