import {
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import authConfig from './config/auth.config';
import { LoginDTO } from './dto/login.dto';
import { NewPasswordDto } from './dto/newPasswordDto';
import { SendOtpDTO } from './dto/sendOtp.dto';
import { VerifyOTPDto } from './dto/verifyOtpDto';
import { HashingProvider } from './provider/hashing.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  public async login(loginInfo: LoginDTO) {
    const { empId, password: inputPwd } = loginInfo;
    // Find the User with Emp ID
    const user = await this.userService.getUserByEmpId(empId);
    const { password: dbPwd } = user;
    let isEqual = false;
    isEqual = await this.hashingProvider.comparePassword(inputPwd, dbPwd);
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }
    // generate Jwt and send response
    const { audience, expiresIn, issuer, secret } = this.authConfiguration;
    const token = await this.jwtService.signAsync(
      {
        id: user?.id,
        empId: user.employmentInfo.empId,
        fullName: user.personalInfo.firstName + user.personalInfo.lastName,
      },
      { secret, expiresIn, issuer, audience },
    );
    return {
      user,
      token,
    };
  }

  @HttpCode(HttpStatus.OK)
  public async sendOtp(sendOtpInfo: SendOtpDTO) {
    const { email } = sendOtpInfo;
    // Find the User with email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }
    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 15); // OTP valid for 15 minutes
    // Save OTP and expiry to user record
    await this.userService.updateOtpDetails(email, otp, otpExpiry);
    return { otp, email };
  }

  public async validateOTP(emailAndOtp: VerifyOTPDto) {
    const { email, otp } = emailAndOtp;
    // Find the User with email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }
    // Validate OTP
    if (user.resetOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    const currentTime = new Date();
    if (user.resetExpiresAt < currentTime) {
      throw new UnauthorizedException('OTP has expired');
    }
    const resetToken = await this.jwtService.signAsync(
      { email: user.employmentInfo.email },
      {
        secret: this.authConfiguration.secret,
        expiresIn: '1h',
        issuer: this.authConfiguration.issuer,
        audience: this.authConfiguration.audience,
      },
    );
    await this.userService.storeResetToken(email, resetToken);
    return { resetToken };
  }

  public async setUpNewPassword(newPasswordDetails: NewPasswordDto) {
    const { resetToken, newPassword } = newPasswordDetails;
    try {
      const decoded: unknown = await this.jwtService.verifyAsync(resetToken, {
        secret: this.authConfiguration.secret,
        issuer: this.authConfiguration.issuer,
        audience: this.authConfiguration.audience,
      });
      const { email } = decoded as { email: string };
      const user = await this.userService.getUserByEmail(email);
      await this.userService.update(user.id, {
        password: newPassword,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
