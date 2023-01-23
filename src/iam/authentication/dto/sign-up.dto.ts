import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/common/decorators/match-validator.decorator';
import { UserExists } from 'src/common/validators/user-exists-rule';

export class SignUpDto {
  @MaxLength(80)
  @IsString()
  name: string;

  @IsEmail()
  @UserExists()
  email: string;

  @MinLength(8)
  password: string;

  @Match(SignUpDto, (s) => s.password)
  passwordConfirmation: string;
}
