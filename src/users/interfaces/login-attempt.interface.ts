import { UserDomain } from './user.interface';

export interface LoginAttemptDomain {
  id: string;
  ipAddress: string;
  numberOfAttempts: number;
  user: UserDomain;
}
