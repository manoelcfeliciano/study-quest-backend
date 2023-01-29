import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from 'src/common/hashing/adapters/bcrypt/bcrypt.service';
import { HashingService } from 'src/common/hashing/hashing.service';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import jwtConfig from './config/jwt.config';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { RefreshTokensIdsStorage } from './authentication/refresh-tokens-ids.storage';
import { RedisModule } from '../common/db/redis/redis.module';
import { GoogleAuthenticationService } from './authentication/social/google-authentication.service';
import { GoogleAuthenticationController } from './authentication/social/google-authentication.controller';
import { OAUTH2_CLIENT_KEY } from './iam.constants';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    RedisModule,
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: OAUTH2_CLIENT_KEY,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
        return new OAuth2Client(clientId, clientSecret);
      },
    },
    AccessTokenGuard,
    AuthenticationService,
    RefreshTokensIdsStorage,
    GoogleAuthenticationService,
  ],
  controllers: [AuthenticationController, GoogleAuthenticationController],
})
export class IamModule {}
