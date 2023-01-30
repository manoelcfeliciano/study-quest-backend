import { Repository } from 'src/common/db/generic.repository';
import { FindOneByOptions } from 'src/common/db/interfaces/helpers';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UserPersistenceMapper } from 'src/users/mappers/user-persistence.mapper';

@Injectable()
export class PrismaUserRepository implements Repository<UserEntity> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userPersistenceMapper: UserPersistenceMapper,
  ) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const createdUser = await this.prismaService.user.create({ data });
    return createdUser;
  }
  async update(id: string, item: UpdateUserDto): Promise<UserEntity> {
    const updatedUser = await this.prismaService.user.update({
      data: item,
      where: { id },
    });
    return updatedUser;
  }
  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({ where: { id } });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) return null;
    return user;
  }

  async findOneBy(
    options: FindOneByOptions<Partial<UserEntity>>,
  ): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: options,
    });
    if (!user) return null;
    return user;
  }
}
