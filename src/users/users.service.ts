import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'src/common/db/generic.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { UserPersistenceMapper } from './mappers/user-persistence.mapper';
import { USERS_REPOSITORY_KEY } from './repositories/prisma/users-repository.config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_KEY)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userPersistenceMapper: UserPersistenceMapper,
    private readonly userResponseDto: UserResponseDto,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const createdUser = await this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role,
    });
    const responseInput = this.userPersistenceMapper.toResponseDto(createdUser);

    return this.userResponseDto.toInstance(responseInput);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    const responseInput = this.userPersistenceMapper.toResponseDto(updatedUser);

    return this.userResponseDto.toInstance(responseInput);
  }

  async get(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne(id);
    const responseInput = this.userPersistenceMapper.toResponseDto(user);

    return this.userResponseDto.toInstance(responseInput);
  }

  async delete(id: string) {
    await this.userRepository.delete(id);
  }
}
