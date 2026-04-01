import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { EHttpStatusCode } from '@/@core/enums/http-status-code';

type ProblemDetails = {
	type: string;
	title: string;
	status: number;
	detail: string | string[];
	instance: string;
};

type HttpValidationResponse = {
	message: string | string[];
	error: string;
	statusCode: number;
	detail?: string | string[];
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<unknown> {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost<ExpressAdapter>,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(GlobalExceptionFilter.name);
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		this.#logError('An unhandled exception was caught', exception);
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const requestUrl = httpAdapter.getRequestUrl(ctx.getRequest());
		const problemDetails = this.#mapToProblemDetails(exception, requestUrl);
		return this.#sendResponse(httpAdapter, response, problemDetails);
	}

	#mapToProblemDetails(exception: unknown, requestUrl: string): ProblemDetails {
		const defaultStatus = EHttpStatusCode.InternalServerError;
		const problemDetails: ProblemDetails = {
			type: this.#getType(defaultStatus),
			status: defaultStatus,
			title: 'Internal Server Error',
			detail: 'An unexpected error occurred. Please try again later.',
			instance: requestUrl,
		};
		if (exception instanceof HttpException) {
			const { message, statusCode } =
				exception.getResponse() as HttpValidationResponse;
			return {
				...problemDetails,
				type: this.#getType(statusCode),
				title: HttpStatus[statusCode] || 'Error',
				status: statusCode,
				detail: Array.isArray(message) ? message : [message],
			};
		}
		if (exception instanceof Error) {
			return {
				...problemDetails,
				detail: exception.message || problemDetails.detail,
			};
		}
		return problemDetails;
	}

	#getType(statusCode: number): string {
		return `https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/${statusCode}`;
	}

	#logError(message: string, exception: unknown): void {
		const serializedError = this.#serializeError(exception);

		if (exception instanceof HttpException && exception.getStatus() < 500) {
			this.logger.warn({ err: serializedError }, 'Handled HTTP exception');
			return;
		}

		this.logger.error({ err: serializedError }, message);
	}

	#serializeError(exception: unknown): Record<string, unknown> {
		if (exception instanceof HttpException) {
			const response = exception.getResponse() as HttpValidationResponse;
			const statusCode = exception.getStatus();
			const detail =
				response.detail ??
				(Array.isArray(response.message)
					? response.message
					: [response.message]);
			return {
				type: exception.constructor.name,
				message: exception.message,
				statusCode,
				error: response.error,
				detail,
				...(statusCode >= 500 && {
					response,
					stack: exception.stack,
				}),
			};
		}
		if (exception instanceof Error) {
			return {
				type: exception.constructor.name,
				message: exception.message,
				stack: exception.stack,
			};
		}
		return { type: 'Unknown', message: String(exception) };
	}

	#sendResponse(
		httpAdapter: ExpressAdapter,
		response: Response,
		problemDetails: ProblemDetails,
	): void {
		return httpAdapter.reply(response, problemDetails, problemDetails.status);
	}
}
