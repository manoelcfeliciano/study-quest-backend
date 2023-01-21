import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './repositories/prisma/users.repository';
import { PrismaUserDomainMapper } from 'src/users/mappers/prisma/user-domain.mapper';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY_KEY } from './repositories/prisma/users-repository.config';

@Module({
  providers: [
    {
      provide: USERS_REPOSITORY_KEY,
      useClass: PrismaUserRepository,
    },
    PrismaUserDomainMapper,
    PrismaService,
    UsersService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
