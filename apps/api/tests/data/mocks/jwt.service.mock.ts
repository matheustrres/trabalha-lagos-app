import { JwtService } from '@nestjs/jwt';
import { mock, type MockProxy } from 'vitest-mock-extended';

export function makeJwtServiceMock(): MockProxy<JwtService> {
	const jwtService = mock<JwtService>();
	jwtService.signAsync.mockResolvedValue('signed-token');
	return jwtService;
}
