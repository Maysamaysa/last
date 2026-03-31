// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const requestId = request.headers['x-request-id'];
    const userId = (request as any).user?.sub;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        this.logger.log({
          method, url, ip,
          statusCode: response.statusCode,
          duration: `${Date.now() - start}ms`,
          requestId, userId,
        });
      }),
      catchError((error) => {
        this.logger.error({
          method, url, ip,
          error: error.message,
          duration: `${Date.now() - start}ms`,
          requestId, userId,
        });
        throw error;
      }),
    );
  }
}
