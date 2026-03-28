# API — TrabalhaLagos

## Convenções

- Base: `/api/v1/`
- Formato: JSON, camelCase nas chaves
- Paginação: query params `page` e `limit` (default: page=1, limit=20)
- Erros: `{ statusCode, message, error }` via exception filter global
- Slugs: vagas e categorias acessíveis por slug (SEO-friendly)

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/jobs` | Público | Listar vagas (filtros: lat, lng, radius, category, contractType, city) |
| `GET` | `/jobs/:slug` | Público | Detalhe da vaga por slug |
| `POST` | `/jobs` | Employer | Criar vaga |
| `PATCH` | `/jobs/:id` | Employer (dono) | Editar vaga |
| `PATCH` | `/jobs/:id/status` | Employer (dono) | Alterar status (pausar, fechar) |
| `POST` | `/jobs/:id/interest` | Candidate | Demonstrar interesse |
| `GET` | `/employer/jobs` | Employer | Minhas vagas |
| `GET` | `/employer/interests` | Employer (PRO+) | Interesses recebidos com dados completos |
| `POST` | `/auth/register` | Público | Cadastro |
| `POST` | `/auth/login` | Público | Login |
| `POST` | `/auth/refresh` | Público | Refresh token |
| `GET` | `/categories` | Público | Categorias com contagem de vagas |
| `GET` | `/companies/:id` | Público | Perfil público da empresa |
| `PATCH` | `/companies/:id` | Employer (dono) | Editar perfil |

## Query params de busca (GET /jobs)

```
?lat=-22.8394&lng=-42.1027    # Coordenadas do candidato
&radius=20                     # Raio em KM
&category=turismo              # Slug da categoria
&contractType=CLT              # Valor do pgEnum contractType
&city=cabo-frio                # Slug da cidade
&page=1&limit=20               # Paginação
&sort=distance                 # distance | recent
```

## Validação (DTOs com Zod)

Todo input usa Zod schema + `ZodValidationPipe`. O pipe transforma erros Zod em `BadRequestException` com mensagens descritivas.

Padrão:
```typescript
// dto/create-job.dto.ts
import { contractTypeEnum } from '@/database/schema/enums';

export const CreateJobSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  categoryId: z.string(),
  contractType: z.enum(contractTypeEnum.enumValues),
  city: z.string(),
  locationLng: z.number().min(-180).max(180),
  locationLat: z.number().min(-90).max(90),
  // ...
});
export type CreateJobDto = z.infer<typeof CreateJobSchema>;
```

Os valores válidos de enums vêm diretamente do schema Drizzle via `.enumValues` — single source of truth.

Referir a `src/modules/*/dto/` para os DTOs atualizados.