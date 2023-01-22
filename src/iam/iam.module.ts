import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from 'src/common/hashing/adapters/bcrypt/bcrypt.service';
import { HashingService } from 'src/common/hashing/hashing.service';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import { PrismaUserRepository } from 'src/users/repositories/prisma/users.repository';
import { AuthenticationService } from './authentication/authentication.service';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    { provide: USERS_REPOSITORY_KEY, useClass: PrismaUserRepository },
    AuthenticationService,
  ],
})
export class IamModule {}
