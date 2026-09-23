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
| `PATCH` | `/auth/password` | Autenticado | Alterar senha e invalidar refresh tokens anteriores |
| `GET` | `/users/me` | Autenticado | Dados básicos da conta |
| `PATCH` | `/users/me` | Autenticado | Atualizar nome e cidade |
| `PATCH` | `/users/me/email` | Autenticado | Alterar e-mail após confirmação da senha atual |
| `DELETE` | `/users/me` | Autenticado | Excluir permanentemente a conta |
| `GET` | `/categories` | Público | Categorias com contagem de vagas |
| `GET` | `/companies/:id` | Público | Perfil público da empresa |
| `PATCH` | `/companies/:id` | Employer (dono) | Editar perfil |

### Contrato de autenticação

- `POST /auth/login`: recebe `email` e `password` para ambas as roles.
- `POST /auth/register`: `email` é obrigatório para `CANDIDATE` e `EMPLOYER`.
- No cadastro de candidato, `phone` é opcional.
- No cadastro de empregador, telefone pessoal não é aceito; `companyName` é
  obrigatório e `companyWhatsapp` e `segment` são opcionais.
- `segment`, quando informado, usa um dos códigos estáveis: `RESTAURANT`,
  `HOTEL`, `RETAIL`, `CONSTRUCTION`, `SERVICES`, `TECHNOLOGY` ou `OTHER`.

### Conta e credenciais

- `PATCH /users/me` recebe `{ "name": string, "city": string }`; cidade deve
  ser uma das cidades disponíveis na Região dos Lagos.
- `PATCH /users/me/email` recebe `{ "email": string, "currentPassword": string }`;
  valida a senha atual e exige que o novo e-mail ainda não esteja cadastrado.
- `PATCH /auth/password` recebe `{ "currentPassword": string,
  "newPassword": string }` e retorna `AuthResponseDto` com novos tokens.
- `DELETE /users/me` recebe `{ "currentPassword": string, "confirmation":
  "EXCLUIR MINHA CONTA" }` e retorna `204 No Content` após apagar a conta e
  seus dados relacionados.

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

### Contrato da resposta de busca

`GET /jobs` combina vagas próprias e externas em uma única paginação. Cada item
possui o discriminador `sourceType`:

- `INTERNAL`: mantém `slug`, `company`, `category`, destaque e acesso ao detalhe
  local em `/vaga/:slug`;
- `EXTERNAL`: fornece `externalSource`, `companyName`, `redirectUrl`,
  `categoryName`, localização e data de publicação já sanitizados. Não possui
  detalhe local.

Durante o trial, somente registros externos com `externalSource: "SYNTHETIC"`
são publicados. Registros importados da Adzuna continuam bloqueados. Quando um
filtro de categoria interna é informado, vagas externas ficam fora do resultado
até existir um mapeamento explícito entre taxonomias.

## Validação (DTOs com class-validator + class-transformer)

Todo input usa class-validator + class-transformer.

Padrão:
```typescript
// dto/create-job.dto.ts
export enum ContractType {
	CLT = 'CLT',
	PJ = 'PJ',
	FREELANCER = 'FREELANCER',
	TEMPORARY = 'TEMPORARY',
	INTERNSHIP = 'INTERNSHIP',
	OTHER = 'OTHER',
}

export enum ContactMethod {
	WHATSAPP = 'WHATSAPP',
	PLATFORM = 'PLATFORM',
	BOTH = 'BOTH',
}

export class CreateJobDto {
	@ApiProperty({ example: 'Atendente de Turismo' })
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(120)
	title!: string;

	@ApiProperty({
		example: 'Descrição detalhada da vaga com requisitos e benefícios...',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(20)
	@MaxLength(5000)
	description!: string;

	@ApiProperty({ example: 1 })
	@IsInt()
	@Min(1)
	@Type(() => Number)
	categoryId!: number;

	@ApiProperty({ enum: ContractType, example: ContractType.CLT })
	@IsEnum(ContractType)
	contractType!: ContractType;

	@ApiProperty({ example: 'Cabo Frio' })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiPropertyOptional({ example: 'Rua das Flores, 123' })
	@IsString()
	@IsOptional()
	address?: string;

	@ApiProperty({ example: -42.0187, description: 'Longitude' })
	@IsNumber()
	@Min(-180)
	@Max(180)
	locationLng!: number;

	@ApiProperty({ example: -22.8789, description: 'Latitude' })
	@IsNumber()
	@Min(-90)
	@Max(90)
	locationLat!: number;

	@ApiPropertyOptional({
		example: 200000,
		description: 'Salário mínimo em centavos',
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	@Type(() => Number)
	salaryMin?: number;

	@ApiPropertyOptional({
		example: 300000,
		description: 'Salário máximo em centavos',
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	@Type(() => Number)
	salaryMax?: number;

	@ApiPropertyOptional({ example: false })
	@IsBoolean()
	@IsOptional()
	salaryHidden?: boolean;

	@ApiProperty({ example: '22999999999' })
	@IsString()
	@MinLength(10)
	@MaxLength(15)
	@IsValidPhoneBR()
	whatsappContact!: string;

	@ApiPropertyOptional({ enum: ContactMethod, example: ContactMethod.WHATSAPP })
	@IsEnum(ContactMethod)
	@IsOptional()
	contactMethod?: ContactMethod;

	@ApiPropertyOptional({
		type: [String],
		example: ['Experiência em atendimento ao cliente'],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	requirements?: string[];

	@ApiPropertyOptional({ example: false, description: 'Apenas plano SEASON' })
	@IsBoolean()
	@IsOptional()
	featured?: boolean;

	@ApiPropertyOptional({ example: false, description: 'Apenas plano SEASON' })
	@IsBoolean()
	@IsOptional()
	urgent?: boolean;
}
```

Os valores válidos de enums vêm diretamente do schema Drizzle via `.enumValues` — single source of truth.

Referir a `src/modules/*/dto/` para os DTOs atualizados.
