import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './repositories/prisma/users.repository';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY_KEY } from './repositories/prisma/users-repository.config';
import { UserDomainMapper } from './mappers/user-domain.mapper';
import { UserPersistenceMapper } from './mappers/user-persistence.mapper';
import { UserResponseDto } from './dto/user-response.dto';
import { RedisModule } from 'src/common/db/redis/redis.module';

const userRepositoryFactory = {
  provide: USERS_REPOSITORY_KEY,
  useClass: PrismaUserRepository,
};

@Module({
  imports: [RedisModule],
  providers: [
    userRepositoryFactory,
    UserDomainMapper,
    UserPersistenceMapper,
    UserResponseDto,
    PrismaService,
    UsersService,
  ],
  controllers: [UsersController],
  exports: [userRepositoryFactory],
})
export class UsersModule {}
