import { PaginationQueryDTO } from 'src/common/pagination/dtos/pagination-query.dto';
import { Role } from '../entities/role.entity';

export class GetAllRolesDto extends PaginationQueryDTO<Role> {}
