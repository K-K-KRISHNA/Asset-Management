/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    console.log(now, 'time');
    // Extract request details
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;

    this.logger.debug(
      `➡️ [REQUEST] ${method} ${url} | Params: ${JSON.stringify(
        params,
      )} | Query: ${JSON.stringify(query)} | Body: ${JSON.stringify(body)}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const time = `${Date.now() - now}ms`;

        this.logger.log(
          `⬅️ [RESPONSE] ${method} ${url} | Status: ${statusCode} | Time: ${time} | Data: ${JSON.stringify(data)}`,
        );
      }),
    );
  }
}
