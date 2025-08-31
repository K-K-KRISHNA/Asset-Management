import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(20, {
    message: 'Role Name should not cross 20 characters',
  })
  name: string;

  @IsOptional()
  @MaxLength(200, {
    message: 'Role Description Should not cross 200 characters',
  })
  description?: string;
}
