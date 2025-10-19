import { IsEmail, IsString, MaxLength } from 'class-validator';

export class VerifyOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(4, { message: 'OTP must be of length 4' })
  otp: string;
}
