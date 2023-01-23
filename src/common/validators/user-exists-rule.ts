import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from '../db/generic.repository';
import { Inject, Injectable } from '@nestjs/common';
import { USERS_REPOSITORY_KEY } from '../../users/repositories/prisma/users-repository.config';

@ValidatorConstraint({ name: 'UserExistsRule', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject(USERS_REPOSITORY_KEY)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async validate(value: string, args?: ValidationArguments) {
    try {
      const propKey = args.property as keyof UserEntity;
      await this.userRepo.findOneBy({ [propKey]: value });
    } catch (e) {
      return true;
    }

    return false;
  }

  defaultMessage(args?: ValidationArguments): string {
    const propKey = args.property as keyof UserEntity;

    return `User with this ${propKey} already exists`;
  }
}

export function UserExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserExistsRule,
    });
  };
}
