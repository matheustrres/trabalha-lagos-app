import { Global, Module } from '@nestjs/common';

import { DatabaseProvider } from '@/shared/modules/database/database.provider';

@Global()
@Module({
	providers: [DatabaseProvider],
	exports: [DatabaseProvider],
})
export class DatabaseModule {}
