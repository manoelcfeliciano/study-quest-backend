import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'src/common/db/generic.repository';
import { OAUTH2_CLIENT_KEY } from 'src/iam/iam.constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class GoogleAuthenticationService {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(OAUTH2_CLIENT_KEY)
    private readonly oauthClient: OAuth2Client,
    @Inject(USERS_REPOSITORY_KEY)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async authenticate(token: string) {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });

      const payload = ticket.getPayload();

      const user = await this.userRepo.findOneBy({
        googleId: payload.sub,
      });

      if (user) {
        return this.authService.generateTokens(user);
      } else {
        const newUser = await this.userRepo.create({
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
        });

        return this.authService.generateTokens(newUser);
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
