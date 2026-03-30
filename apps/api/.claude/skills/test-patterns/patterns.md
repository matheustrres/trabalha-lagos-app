# Padrões de Testes E2E e Unit

## Setup E2E (padrão obrigatório)

```typescript
import { createAppFixture } from '../__helpers/app-fixture';
import { cleanDatabase } from '../__helpers/database-cleaner';

let app: INestApplication;
let db: DatabaseService;

beforeAll(async () => {
	const fixture = await createAppFixture({
		shouldClearAllDb: true,
	});
	app = fixture.app;
	db = fixture.db;
});

afterAll(async () => {
	await app.close();
});

afterEach(async () => {
	await new Promise((r) => setTimeout(r, 200));
	await cleanDatabase(db);
});
```

Nunca reimplemente o setup — use `createAppFixture` e `cleanDatabase` dos helpers.

---

## E2E — Happy Path Only

Um `describe` por endpoint, um `it` por happy path. Nada mais.

```typescript
const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';

describe('POST /auth/register', () => {
	it('returns 201 with accessToken, refreshToken and user data', async () => {
		const res = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.send(validRegisterPayload)
			.expect(201);

		expect(res.body).toMatchObject({
			accessToken: expect.any(String),
			refreshToken: expect.any(String),
			user: {
				id: expect.any(String),
				name: 'Maria Souza',
				phone: '22999990001',
				role: 'CANDIDATE',
			},
		});
	});
});

describe('POST /auth/login', () => {
	it('returns 200 with tokens when credentials are valid', async () => {
		const res = await request(app.getHttpServer())
			.post(LOGIN_URL)
			.send({ phone: '22999990001', password: 'senha@123' })
			.expect(200);

		expect(res.body).toMatchObject({
			accessToken: expect.any(String),
			refreshToken: expect.any(String),
			user: {
				phone: '22999990001',
				role: 'CANDIDATE',
			},
		});
	});
});
```

Não teste RBAC, cross-tenant, validações ou erros no E2E — isso é responsabilidade dos unit tests.

---

## Unit Test — Service

Unit tests cobrem toda a lógica: sucesso, erros, RBAC, isolamento e edge cases.

```typescript
describe(AuthService.name, () => {
	let SUT: AuthService;
	let usersService: MockProxy<UsersService>;
	let companiesService: MockProxy<CompaniesService>;
	let jwtService: MockProxy<JwtService>;
	let envService: MockProxy<EnvService>;

	beforeEach(() => {
		vi.clearAllMocks();

		usersService = makeUsersServiceMock();
		companiesService = makeCompaniesServiceMock();
		jwtService = makeJwtServiceMock();
		envService = makeEnvServiceStub();

		SUT = new AuthService(
			usersService,
			companiesService,
			jwtService,
			envService,
		);
	});

	describe('register', () => {
		it('returns tokens and user data when phone is available', async () => {
			const dto = aRegisterDto().build();
			const userBuilder = aUser();

			usersService.findByPhone.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue('$argon2id$mock-hash' as never);
			usersService.create.mockResolvedValue(
				asCreateReturn(userBuilder.buildCreated()),
			);

			const result = await SUT.register(dto);

			expect(result.accessToken).toBe('signed-token');
			expect(result.refreshToken).toBe('signed-token');
			expect(result.user).toEqual({
				id: userBuilder.build().id,
				name: userBuilder.build().name,
				phone: userBuilder.build().phone,
				role: userBuilder.build().role,
			});
		});

		it('hashes the password before storing (never stores raw password)', async () => {
			const dto = aRegisterDto().withPassword('senha@123').build();
			const hash = '$argon2id$hashed';

			usersService.findByPhone.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue(hash as never);
			usersService.create.mockResolvedValue(
				asCreateReturn(aUser().withPasswordHash(hash).buildCreated()),
			);

			await SUT.register(dto);

			expect(argon2.hash).toHaveBeenCalledWith('senha@123');
			const createArg = usersService.create.mock.calls[0]?.[0];
			expect(createArg).not.toHaveProperty('password');
			expect(createArg).toHaveProperty('passwordHash', hash);
		});

		it('generates both access and refresh tokens on success', async () => {
			const dto = aRegisterDto().build();

			usersService.findByPhone.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue('$argon2id$hash' as never);
			usersService.create.mockResolvedValue(
				asCreateReturn(aUser().buildCreated()),
			);

			await SUT.register(dto);

			expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
			const [accessCall, refreshCall] = jwtService.signAsync.mock.calls;
			expect(accessCall?.[1]).toMatchObject({ secret: 'test-secret' });
			expect(refreshCall?.[1]).toMatchObject({ secret: 'test-refresh-secret' });
		});

		it('throws ConflictException when phone is already registered', async () => {
			const dto = aRegisterDto().build();

			usersService.findByPhone.mockResolvedValue(aUser().build());

			await expect(SUT.register(dto)).rejects.toThrow(ConflictException);
			expect(usersService.create).not.toHaveBeenCalled();
			expect(argon2.hash).not.toHaveBeenCalled();
		});
	});
});
```
