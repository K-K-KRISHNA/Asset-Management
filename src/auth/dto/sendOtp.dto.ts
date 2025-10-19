import { IsEmail } from 'class-validator';

export class SendOtpDTO {
  @IsEmail()
  email: string;
}
