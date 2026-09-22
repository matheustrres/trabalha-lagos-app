import { inject } from 'vitest';

const environment = inject('e2eEnvironment');

Object.assign(process.env, environment);
