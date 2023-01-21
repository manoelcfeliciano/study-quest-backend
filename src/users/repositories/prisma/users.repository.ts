import { Repository } from 'src/common/db/generic.repository';
import { UserDomain } from '../../interfaces/user.interface';
import { FindOneByOptions } from 'src/common/db/interfaces/helpers';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { PrismaUserDomainMapper } from 'src/users/mappers/prisma/user-domain.mapper';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class PrismaUserRepository
  implements Repository<UserEntity, UserDomain>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly prismaUserMapper: PrismaUserDomainMapper,
  ) {}

  async create(data: CreateUserDto): Promise<UserDomain> {
    const createdUser = await this.prismaService.user.create({ data });
    return this.prismaUserMapper.toDomain(createdUser);
  }
  async update(id: string, item: UpdateUserDto): Promise<UserDomain> {
    const updatedUser = await this.prismaService.user.update({
      data: item,
      where: { id },
    });
    return this.prismaUserMapper.toDomain(updatedUser);
  }
  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({ where: { id } });
  }

  async findOne(id: string): Promise<UserDomain> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    return this.prismaUserMapper.toDomain(user);
  }

  async findOneBy(
    options: FindOneByOptions<Partial<UserEntity>>,
  ): Promise<UserDomain> {
    const user = await this.prismaService.user.findUnique({
      where: options,
    });
    return this.prismaUserMapper.toDomain(user);
  }
}
