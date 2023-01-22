import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BcryptService } from './common/hashing/adapters/bcrypt/bcrypt.service';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, IamModule],
  controllers: [AppController],
  providers: [
    AppService,
    BcryptService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
