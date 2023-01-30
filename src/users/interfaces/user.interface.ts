import { Role } from '../enums/role.enum';

export interface UserDomain {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: Role;
  loginAttempts: number;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
