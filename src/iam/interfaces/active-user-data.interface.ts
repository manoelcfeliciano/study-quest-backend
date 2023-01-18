import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  id: string;
  email: string;
  role: Role;
}
