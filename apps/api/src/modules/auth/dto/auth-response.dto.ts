import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

export class AuthResponseDto {
	@ApiProperty({ example: 'eyJ...' })
	accessToken!: string;

	@ApiProperty({ example: 'eyJ...' })
	refreshToken!: string;

	@ApiProperty({ type: UserResponseDto })
	user!: Pick<
		UserResponseDto,
		'id' | 'name' | 'email' | 'phone' | 'role' | 'city'
	>;
}
