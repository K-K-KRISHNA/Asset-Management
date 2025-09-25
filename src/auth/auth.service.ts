import {
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { HashingProvider } from './provider/hashing.provider';
import authConfig from './config/auth.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';

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
}
