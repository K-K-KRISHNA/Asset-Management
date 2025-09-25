export interface HttpExceptionResponse {
  statusCode: number;
  message: string[] | string;
  error: string;
}

export interface HttpExceptionError {
  status: boolean;
  error: string;
  data: [];
}
