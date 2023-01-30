import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { SocialSignInDto } from '../dto/social-sign-in.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('auth/google')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthService: GoogleAuthenticationService,
  ) {}

  @Post()
  async authenticate(@Body() socialSignInDto: SocialSignInDto) {
    return this.googleAuthService.authenticate(socialSignInDto.accessToken);
  }
}
