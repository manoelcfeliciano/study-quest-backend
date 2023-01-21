import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsIn([Role.student, Role.teacher])
  readonly role: Role;
}
