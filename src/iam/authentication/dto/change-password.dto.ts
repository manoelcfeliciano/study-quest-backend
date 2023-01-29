import { MinLength } from 'class-validator';

export class ChangePasswordDto {
  oldPassword: string;

  @MinLength(8)
  newPassword: string;
}
