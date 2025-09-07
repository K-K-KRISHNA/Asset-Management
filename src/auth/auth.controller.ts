import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { MakePublic } from './decorators/make-public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MakePublic()
  @Post('/login')
  public login(@Body() loginInfo: LoginDTO) {
    return this.authService.login(loginInfo);
  }
}
