# Database — TrabalhaLagos

## PostgreSQL + PostGIS

Usar imagem `postgis/postgis:16-3.4` (não `postgres`). A extensão PostGIS deve ser habilitada na primeira migration:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Drizzle ORM

### Setup com NestJS

O Drizzle é injetado como provider no NestJS:

```typescript
// src/shared/modules/database/database.provider.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export type Database = typeof db;

// Provider para injeção
export const DATABASE_TOKEN = Symbol('DATABASE');
export const DatabaseProvider = {
  provide: DATABASE_TOKEN,
  useValue: db,
};
```

Repositórios injetam via `@Inject(DATABASE_TOKEN)`.

### Identidade do usuário

Na tabela `users`, `email` é obrigatório e único e representa a credencial de
login. `phone` é anulável e não é único, pois é apenas um contato opcional do
candidato. Empregadores não armazenam telefone pessoal em `users.phone`; o
contato comercial opcional fica em `companies.whatsapp`.

### Schema — Organização

```
src/shared/modules/database/schema/
├── enums.ts          # pgEnum: role, contractType, jobStatus, plan, etc.
├── users.ts          # Tabela users (uuid v7)
├── companies.ts      # Tabela companies (uuid v7)
├── jobs.ts           # Tabela jobs (uuid v7, coluna geometry PostGIS)
├── interests.ts      # Tabela interests (uuid v7)
├── categories.ts     # Tabela categories (serial)
├── relations.ts      # Todas as relações (relations API do Drizzle)
└── index.ts          # Re-export de tudo
```

### Estratégia de IDs

| Entidade | Tipo de ID | Justificativa |
|---|---|---|
| users | `uuid v7` | Exposto na API, sensível. Tipo nativo 16 bytes, time-sortable |
| companies | `uuid v7` | Exposto na API, sensível |
| jobs | `uuid v7` | Exposto na API, sensível |
| interests | `uuid v7` | Exposto na API, sensível |
| categories | `serial` | Dados públicos seeded, ~10 linhas, FK em jobs é 4 bytes vs 16 |

UUID v7 gerado via `uuidv7()` do pacote `uuidv7`. Tipo nativo `uuid` do PostgreSQL (16 bytes, comparação binária, inserções sequenciais no B-tree).

Cidades **não** são tabela — permanecem como constantes em `src/common/constants/cities.ts`.

### Enums

```typescript
// src/shared/modules/database/schema/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['CANDIDATE', 'EMPLOYER', 'ADMIN']);
export const contractTypeEnum = pgEnum('contract_type', ['CLT', 'PJ', 'FREELANCER', 'TEMPORARY', 'INTERNSHIP', 'OTHER']);
export const jobStatusEnum = pgEnum('job_status', ['ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED']);
export const planEnum = pgEnum('plan', ['FREE', 'PRO', 'SEASON']);
export const contactMethodEnum = pgEnum('contact_method', ['WHATSAPP', 'PLATFORM', 'BOTH']);
export const interestStatusEnum = pgEnum('interest_status', ['SENT', 'VIEWED', 'CONTACTED', 'REJECTED']);
```

### Tabela Jobs (com PostGIS)

A coluna `location` usa o tipo `geometry('point')` nativo do Drizzle com SRID 4326 e índice GiST declarativo:

```typescript
// src/shared/modules/database/schema/jobs.ts
import { pgTable, text, integer, boolean, timestamp, index, uuid } from 'drizzle-orm/pg-core';
import { geometry } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { contractTypeEnum, jobStatusEnum, contactMethodEnum } from './enums';
import { companies } from './companies';
import { categories } from './categories';

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  contractType: contractTypeEnum('contract_type').notNull(),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryHidden: boolean('salary_hidden').default(false).notNull(),
  city: text('city').notNull(),
  address: text('address'),
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  whatsappContact: text('whatsapp_contact'),
  contactMethod: contactMethodEnum('contact_method').default('WHATSAPP').notNull(),
  status: jobStatusEnum('status').default('ACTIVE').notNull(),
  featured: boolean('featured').default(false).notNull(),
  urgent: boolean('urgent').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  interestCount: integer('interest_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('jobs_location_gist').using('gist', t.location),
  index('jobs_status_idx').on(t.status),
  index('jobs_city_idx').on(t.city),
  index('jobs_category_idx').on(t.categoryId),
  index('jobs_created_idx').on(t.createdAt),
]);
```

**Inserção de ponto geográfico:**

```typescript
await db.insert(jobs).values({
  // ... outros campos
  location: { x: -42.0187, y: -22.8789 },  // x=longitude, y=latitude
});
```

**CUIDADO:** no modo `xy`, `x` é longitude e `y` é latitude. Contra-intuitivo, mas é o padrão PostGIS.

### Query de busca por raio

Esta é a query mais importante do sistema. Vive em `jobs.repository.ts`:

```typescript
import { sql, getColumns } from 'drizzle-orm';
import { jobs } from '@/database/schema';

async findByRadius(lat: number, lng: number, radiusKm: number, filters: JobFilters) {
  const point = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  const results = await this.db
    .select({
      ...getColumns(jobs),
      distanceKm: sql<number>`ST_Distance(${jobs.location}, ${point}) / 1000`,
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.status, 'ACTIVE'),
        gt(jobs.expiresAt, sql`NOW()`),
        sql`ST_DWithin(${jobs.location}, ${point}, ${radiusKm * 1000})`,
        filters.category ? eq(jobs.categoryId, filters.category) : undefined,
        filters.contractType ? eq(jobs.contractType, filters.contractType) : undefined,
        filters.city ? eq(jobs.city, filters.city) : undefined,
      ),
    )
    .orderBy(
      desc(jobs.featured),
      sql`ST_Distance(${jobs.location}, ${point})`,
    )
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit);

  return results;
}
```

**Vantagem sobre Prisma:** a query combina o query builder type-safe do Drizzle com `sql` template literals para as funções PostGIS. Sem `$queryRaw` opaco — os filtros são composíveis e safe.

### Armadilhas PostGIS

- `ST_MakePoint(longitude, latitude)` — longitude PRIMEIRO, sempre
- `ST_DWithin` recebe distância em **metros** — converter km × 1000
- O índice GiST em `jobs.location` é essencial — nunca dropar
- No modo `xy` do Drizzle: `x = longitude`, `y = latitude`
- Drizzle usa `geometry` por default, não `geography`. Para distâncias precisas em graus, fazer cast: `::geography`

### Workflow de alteração do schema

1. Editar arquivos em `src/shared/modules/database/schema/`
2. `npx drizzle-kit generate` — gera migration SQL
3. Revisar a migration gerada em `src/shared/modules/database/migrations/`
4. `npx drizzle-kit migrate` — aplicar
5. Atualizar DTOs e types afetados
6. `npm run test`

**Nota:** o drizzle-kit gera SQL puro nas migrations — fácil de revisar e versionar. Se precisar de SQL customizado (ex: `CREATE EXTENSION postgis`), criar migration manual na pasta.

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/modules/database/schema/index.ts',
  out: './src/shared/modules/database/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  extensionsFilters: ['postgis'],  // Ignora tabelas internas do PostGIS
});
```

O `extensionsFilters: ['postgis']` evita que o drizzle-kit inclua tabelas internas do PostGIS (`geometry_columns`, `spatial_ref_sys`) nas migrations.

### Entidades principais

- `users` — candidato ou empregador, discriminado por `role`. PK: `uuid v7`
- `companies` — perfil da empresa, 1:1 com users (role=EMPLOYER). PK: `uuid v7`
- `jobs` — vaga publicada, N:1 companies, N:1 categories, coluna `location` PostGIS. PK: `uuid v7`, FK categoryId: `integer`
- `external_jobs` — vaga importada ou sintética, isolada de `jobs`, com identidade única por `source + externalId`, coordenadas PostGIS e URL de redirecionamento. O seed local usa somente `source = SYNTHETIC`.
- `interests` — manifestação de interesse, unique constraint `[userId, jobId]`. PK: `uuid v7`
- `categories` — lista fixa de categorias de vagas (seeded). PK: `serial`

Referir a `src/shared/modules/database/schema/` para o schema completo e atualizado.
