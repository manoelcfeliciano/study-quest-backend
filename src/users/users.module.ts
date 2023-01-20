import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './repositories/prisma/user.repository';
import { PrismaUserDomainMapper } from 'src/users/mappers/prisma/user-domain.mapper';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { USER_REPOSITORY_KEY } from './repositories/prisma/user-repository.config';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY_KEY,
      useClass: PrismaUserRepository,
    },
    PrismaUserDomainMapper,
    PrismaService,
    UsersService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
