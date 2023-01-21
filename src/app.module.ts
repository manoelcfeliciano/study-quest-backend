import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BcryptService } from './common/hashing/adapters/bcrypt/bcrypt.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BcryptService],
})
export class AppModule {}
