import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MakePublic } from './decorators/make-public.decorator';
import { LoginDTO } from './dto/login.dto';

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
}
