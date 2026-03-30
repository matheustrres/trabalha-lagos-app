import { Global, Module } from '@nestjs/common';

import { DatabaseProvider } from '@/database';

@Global()
@Module({
	providers: [DatabaseProvider],
	exports: [DatabaseProvider],
})
export class DatabaseModule {}
