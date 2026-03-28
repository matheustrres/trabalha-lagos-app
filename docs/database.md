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
// src/database/index.ts
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

### Schema — Organização

```
src/database/schema/
├── enums.ts          # pgEnum: role, contractType, jobStatus, plan, etc.
├── users.ts          # Tabela users
├── companies.ts      # Tabela companies
├── jobs.ts           # Tabela jobs (com coluna geometry PostGIS)
├── interests.ts      # Tabela interests
├── categories.ts     # Tabela categories (self-ref)
├── relations.ts      # Todas as relações (relations API do Drizzle)
└── index.ts          # Re-export de tudo
```

### Enums

```typescript
// src/database/schema/enums.ts
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
// src/database/schema/jobs.ts
import { pgTable, text, integer, boolean, timestamp, index, serial } from 'drizzle-orm/pg-core';
import { geometry } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { contractTypeEnum, jobStatusEnum, contactMethodEnum } from './enums';
import { companies } from './companies';
import { categories } from './categories';

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  companyId: text('company_id').notNull().references(() => companies.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),
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

1. Editar arquivos em `src/database/schema/`
2. `npx drizzle-kit generate` — gera migration SQL
3. Revisar a migration gerada em `src/database/migrations/`
4. `npx drizzle-kit migrate` — aplicar
5. Atualizar DTOs e types afetados
6. `pnpm test`

**Nota:** o drizzle-kit gera SQL puro nas migrations — fácil de revisar e versionar. Se precisar de SQL customizado (ex: `CREATE EXTENSION postgis`), criar migration manual na pasta.

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  extensionsFilters: ['postgis'],  // Ignora tabelas internas do PostGIS
});
```

O `extensionsFilters: ['postgis']` evita que o drizzle-kit inclua tabelas internas do PostGIS (`geometry_columns`, `spatial_ref_sys`) nas migrations.

### Entidades principais

- `users` — candidato ou empregador, discriminado por `role`
- `companies` — perfil da empresa, 1:1 com users (role=EMPLOYER)
- `jobs` — vaga publicada, N:1 companies, N:1 categories, coluna `location` PostGIS
- `interests` — manifestação de interesse, unique constraint `[userId, jobId]`
- `categories` — árvore self-referencing via `parentId`

Referir a `src/database/schema/` para o schema completo e atualizado.