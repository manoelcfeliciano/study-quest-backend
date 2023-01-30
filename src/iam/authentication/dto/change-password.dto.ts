import { IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  oldPassword: string;

  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minLength: 8,
  })
  newPassword: string;
}
