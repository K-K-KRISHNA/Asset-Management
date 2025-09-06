import { IsOptional } from 'class-validator';

export class PaginationQueryDTO<T> {
  @IsOptional()
  pageNumber?: number;

  @IsOptional()
  perPage?: number;

  @IsOptional()
  sendAll?: boolean;

  @IsOptional()
  sortBy?: keyof T;

  @IsOptional()
  order?: 'ASC' | 'DESC';
}
