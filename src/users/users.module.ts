import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './repositories/prisma/user.repository';
import { PrismaUserMapper } from 'src/users/mappers/prisma/user.mapper';
import { PrismaService } from 'src/common/db/prisma/prisma.service';

@Module({
  providers: [PrismaUserRepository, PrismaUserMapper, PrismaService],
})
export class UsersModule {}
