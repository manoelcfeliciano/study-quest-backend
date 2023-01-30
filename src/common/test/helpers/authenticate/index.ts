import { INestApplication } from '@nestjs/common';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import * as request from 'supertest';
import { HashingService } from 'src/common/hashing/hashing.service';

export class Authenticate {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
  ) {}

  handle = async (app: INestApplication) => {
    const fakeAuthUser = makeFakeUser();

    await this.prismaService.user.create({
      data: {
        ...fakeAuthUser,
        loginAttempts: 0,
        password: await this.hashingService.hash(fakeAuthUser.password),
      },
    });

    const authResponse = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: fakeAuthUser.email,
        password: fakeAuthUser.password,
      });

    return {
      accessToken: authResponse.body.accessToken,
      authUser: fakeAuthUser,
    };
  };
}
