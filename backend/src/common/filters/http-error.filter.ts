import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponseBody = {
  code?: string;
  message?: string | string[];
  details?: unknown;
};

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawBody = exception instanceof HttpException
      ? exception.getResponse()
      : undefined;
    const body = typeof rawBody === 'object' && rawBody !== null
      ? rawBody as ErrorResponseBody
      : undefined;

    response.status(status).json({
      success: false,
      error: {
        code: body?.code ?? this.defaultCode(status),
        message: body?.message ?? this.defaultMessage(status),
        details: body?.details ?? null
      },
      request: {
        method: request.method,
        path: request.originalUrl
      },
      timestamp: new Date().toISOString()
    });
  }

  private defaultCode(status: number): string {
    if (status === HttpStatus.BAD_REQUEST) return 'BAD_REQUEST';
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHORIZED';
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    return 'INTERNAL_SERVER_ERROR';
  }

  private defaultMessage(status: number): string {
    if (status >= 500) {
      return 'Unexpected server error.';
    }

    return 'Request could not be processed.';
  }
}
