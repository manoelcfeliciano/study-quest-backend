import { RoleEnumType } from '@prisma/client';

export type UserEntity = {
  id?: string;
  email: string;
  name: string;
  password: string | null;
  role: RoleEnumType;
  loginAttempts: number;
  createdAt?: Date;
  updatedAt?: Date;
};
