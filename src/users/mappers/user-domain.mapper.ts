import { Injectable } from '@nestjs/common';
import { RoleEnumType } from '@prisma/client';
import { DomainMapper } from 'src/common/db/domain.mapper';
import { Role } from 'src/users/enums/role.enum';
import { UserEntity } from '../entities/user.entity';
import { UserDomain } from '../interfaces/user.interface';

@Injectable()
export class UserDomainMapper implements DomainMapper<UserDomain, UserEntity> {
  toInputDto(domainObject: UserDomain) {
    return {
      name: domainObject.name,
      email: domainObject.email,
      password: domainObject.password,
      role: Role[RoleEnumType[domainObject.role]],
    };
  }

  toResponseDto(domainObject: UserDomain) {
    return {
      id: domainObject.id,
      email: domainObject.email,
      name: domainObject.name,
      loginAttempts: domainObject.loginAttempts,
      role: Role[RoleEnumType[domainObject.role]],
      createdAt: domainObject.createdAt.toISOString(),
      updatedAt: domainObject.updatedAt.toISOString(),
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
      googleId: domainObject.googleId,
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
    };
  }
}
