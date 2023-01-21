import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'src/common/db/generic.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserDomain } from './interfaces/user.interface';
import { USERS_REPOSITORY_KEY } from './repositories/prisma/users-repository.config';

export type UserRepository = Repository<UserEntity, UserDomain>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_KEY)
    private readonly userRepository: UserRepository,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role,
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  get(id: string) {
    return this.userRepository.findOne(id);
  }

  async delete(id: string) {
    await this.userRepository.delete(id);
  }
}
