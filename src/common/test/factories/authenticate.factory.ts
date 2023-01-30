import { Authenticate } from '../helpers/authenticate';
import { BcryptService } from '../../hashing/adapters/bcrypt/bcrypt.service';
import { PrismaService } from 'src/common/db/prisma/prisma.service';

const prismaService = new PrismaService();

export const makeAuthenticate = (): Authenticate => {
  const hashshingService = new BcryptService();

  return new Authenticate(hashshingService, prismaService);
};
