import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MakePublic } from './decorators/make-public.decorator';
import { LoginDTO } from './dto/login.dto';
import { NewPasswordDto } from './dto/newPasswordDto';
import { SendOtpDTO } from './dto/sendOtp.dto';
import { VerifyOTPDto } from './dto/verifyOtpDto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MakePublic()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginInfo: LoginDTO) {
    const data = await this.authService.login(loginInfo);
    return { status: true, message: 'Logged In Successfully', data };
  }

  @MakePublic()
  @Post('/sendOtp')
  @HttpCode(HttpStatus.OK)
  public async sendOtp(@Body() sendOtpInfo: SendOtpDTO) {
    const data = await this.authService.sendOtp(sendOtpInfo);
    return { status: true, message: 'OTP sent Successfully', data };
  }

  @MakePublic()
  @Post('/verifyOtp')
  @HttpCode(HttpStatus.OK)
  public async verifyOtp(@Body() verifyOtpInfo: VerifyOTPDto) {
    const data = await this.authService.validateOTP(verifyOtpInfo);
    return { status: true, message: 'OTP verified Successfully', data };
  }

  @MakePublic()
  @Post('/resetPassword')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(@Body() resetPasswordInfo: NewPasswordDto) {
    const data = await this.authService.setUpNewPassword(resetPasswordInfo);
    return { status: true, message: 'Password reset Successfully', data };
  }
}
