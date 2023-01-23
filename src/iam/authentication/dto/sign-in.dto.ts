import { IsEmail, MinLength } from 'class-validator';
import { UserExists } from 'src/common/validators/user-exists-rule';

export class SignInDto {
  @IsEmail()
  @UserExists()
  email: string;

  @MinLength(8)
  password: string;
}
