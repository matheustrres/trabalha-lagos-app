export type E2eEnvironment = {
	DATABASE_URL: string;
	PG_USER: string;
	PG_PASSWORD: string;
	PG_HOST: string;
	PG_PORT: string;
	PG_DATABASE: string;
	REDIS_HOST: string;
	REDIS_PORT: string;
	REDIS_PASSWORD: string;
};

declare module 'vitest' {
	export interface ProvidedContext {
		e2eEnvironment: E2eEnvironment;
	}
}
