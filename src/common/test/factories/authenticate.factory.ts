import { Authenticate } from '../helpers/authenticate';
import { BcryptService } from '../../hashing/adapters/bcrypt/bcrypt.service';
import { PrismaService } from 'src/common/db/prisma/prisma.service';

export const makeAuthenticate = (): Authenticate => {
  const hashshingService = new BcryptService();
  const prismaService = new PrismaService();

  return new Authenticate(hashshingService, prismaService);
};
