import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  sub: string;
  email: string;
  role: Role;
}
