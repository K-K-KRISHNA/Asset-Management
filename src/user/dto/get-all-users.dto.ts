import { IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDTO } from 'src/common/pagination/dtos/pagination-query.dto';
import { User } from '../entities/user.entity';

export class GetAllUsersDto extends PaginationQueryDTO<User> {
  @IsOptional()
  @IsInt()
  roleId?: number;
}
