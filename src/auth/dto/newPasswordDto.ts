import { IsString } from 'class-validator';

export class NewPasswordDto {
  @IsString()
  resetToken: string;

  @IsString()
  newPassword: string;
}
