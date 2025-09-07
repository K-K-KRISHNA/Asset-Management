import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsInt()
  @IsNotEmpty()
  empId: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
