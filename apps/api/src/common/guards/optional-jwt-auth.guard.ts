import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that tries JWT authentication but allows unauthenticated requests.
 * Use on routes that are public but can optionally use an authenticated user.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
	canActivate(context: ExecutionContext) {
		return super.canActivate(context);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleRequest(_err: any, user: any): any {
		// Return the user if authenticated, null if not — never throw
		return user ?? null;
	}
}
