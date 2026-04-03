import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';

import { Public } from '@/common/decorators/public.decorator';

import { SwaggerRoute } from '@/shared/docs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Public()
	@Get()
	@Throttle({
		medium: { limit: 300, ttl: 60000 },
	})
	@SwaggerRoute({
		operation: 'Listar categorias com contagem de vagas ativas',
		responses: [
			{
				type: [CategoryResponseDto],
			},
		],
	})
	async findAll(): Promise<CategoryResponseDto[]> {
		return this.categoriesService.findAll();
	}
}
