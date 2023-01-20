import { Injectable } from '@nestjs/common';
import { RoleEnumType } from '@prisma/client';
import { Mapper } from 'src/common/db/generic.mapper';
import { Role } from 'src/users/enums/role.enum';
import { UserEntity } from '../../entities/user.entity';
import { UserDomain } from '../../interfaces/user.interface';

@Injectable()
export class PrismaUserDomainMapper implements Mapper<UserDomain, UserEntity> {
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

  toDto(persistanceObject: UserEntity) {
    return {
      name: persistanceObject.name,
      email: persistanceObject.email,
      password: persistanceObject.password,
      role: Role[RoleEnumType[persistanceObject.role]],
    };
  }

  toPersistence(domainObject: UserDomain): UserEntity {
    return {
      id: domainObject.id,
      email: domainObject.email,
      name: domainObject.name,
      password: domainObject.password,
      loginAttempts: domainObject.loginAttempts,
      role: RoleEnumType[Role[domainObject.role]],
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
    };
  }
}
