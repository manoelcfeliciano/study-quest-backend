import { Exclude, instanceToPlain } from 'class-transformer';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from '../enums/role.enum';

export class UserResponseDto implements ResponseDto {
  id: string;
  name: string;
  email: string;

  @Exclude()
  password: string;

  role: Role;
  loginAttempts: number;
  createdAt: string;
  updatedAt: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  toPlain() {
    return instanceToPlain(this);
  }

  toInstance(partial: Partial<UserResponseDto>) {
    return Object.assign(this, partial);
  }
}
