// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const isDev = process.env.NODE_ENV === 'development';

    this.logger.warn({
      type: 'HTTP_EXCEPTION',
      status,
      method: request.method,
      url: request.url,
      requestId: request.headers['x-request-id'],
      userId: (request as any).user?.sub,
      ip: request.ip,
      message: exception.message,
    });

    const errorBody = {
      success: false,
      error: {
        statusCode: status,
        code: this.getErrorCode(status),
        message: typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exception.message,
        ...(isDev && typeof exceptionResponse === 'object'
          ? { details: exceptionResponse }
          : {}),
      },
      requestId: request.headers['x-request-id'],
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorBody);
  }

  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
