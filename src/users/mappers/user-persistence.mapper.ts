import { Injectable } from '@nestjs/common';
import { RoleEnumType } from '@prisma/client';
import { PersistenceMapper } from 'src/common/db/persistence.mapper';
import { Role } from 'src/users/enums/role.enum';
import { UserEntity } from '../entities/user.entity';
import { UserDomain } from '../interfaces/user.interface';

@Injectable()
export class UserPersistenceMapper
  implements PersistenceMapper<UserDomain, UserEntity>
{
  toDomain(persistanceObject: UserEntity): UserDomain {
    return {
      id: persistanceObject.id,
      email: persistanceObject.email,
      name: persistanceObject.name,
      password: persistanceObject.password,
      loginAttempts: persistanceObject.loginAttempts,
      role: Role[RoleEnumType[persistanceObject.role]],
      createdAt: persistanceObject.createdAt,
      updatedAt: persistanceObject.updatedAt,
    };
  }

  toInputDto(persistanceObject: UserEntity) {
    return {
      name: persistanceObject.name,
      email: persistanceObject.email,
      password: persistanceObject.password,
      role: Role[RoleEnumType[persistanceObject.role]],
    };
  }

  toResponseDto(persistanceObject: UserEntity) {
    return {
      id: persistanceObject.id,
      email: persistanceObject.email,
      name: persistanceObject.name,
      loginAttempts: persistanceObject.loginAttempts,
      role: Role[RoleEnumType[persistanceObject.role]],
      createdAt: persistanceObject.createdAt.toISOString(),
      updatedAt: persistanceObject.updatedAt.toISOString(),
    };
  }
}
