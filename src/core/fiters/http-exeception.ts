import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpExceptionError, HttpExceptionResponse } from '../interfaces/types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errResponse = exception.getResponse();
    const errMessage =
      (errResponse as HttpExceptionResponse).message ||
      (errResponse as HttpExceptionError).error;

    response.status(status).json({
      status: false,
      message: errMessage,
      data: null,
    });
  }
}
