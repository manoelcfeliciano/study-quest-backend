import { Role } from '../enums/role.enum';

export interface UserDomain {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  loginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}
