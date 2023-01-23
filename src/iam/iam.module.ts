import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from 'src/common/hashing/adapters/bcrypt/bcrypt.service';
import { HashingService } from 'src/common/hashing/hashing.service';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import jwtConfig from './config/jwt.config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    AuthenticationService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
