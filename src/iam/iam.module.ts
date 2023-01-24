import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    AccessTokenGuard,
    AuthenticationService,
    RefreshTokensIdsStorage,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
