import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SignUpDto } from '../authentication/dto/sign-up.dto';
import { clear } from 'src/common/db/prisma/test.utils';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { makeE2ETestModule } from 'src/common/test/factories/test-module-e2e.factory';

const prismaService = new PrismaService();

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testModule = await makeE2ETestModule();
    app = testModule.app;
    await app.init();
  });

  afterAll(async () => {
    await clear('postgres');
  });

  describe('/sign-up (POST)', () => {
    it('should return 201 when sign up is successful', async () => {
      const signUpDto: SignUpDto = {
        name: 'any_name',
        email: 'valid@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password',
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/sign-up`)
        .send(signUpDto)
        .expect(201);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('should return 500 when sign up is unsuccessful', async () => {
      const fakeUser = makeFakeUser();
      const user = await prismaService.user.create({
        data: fakeUser,
      });

      const signUpDto: SignUpDto = {
        name: user.name,
        email: user.email,
        password: user.password,
        passwordConfirmation: user.password,
      };

      await request(app.getHttpServer())
        .post(`/auth/sign-up`)
        .send(signUpDto)
        .expect(409);
    });

    describe('should return 400 when', () => {
      describe('name', () => {
        it('is not a string', async () => {
          const signUpDto: SignUpDto = {
            name: 123 as any,
            email: 'valid@email.com',
            password: '12345678',
            passwordConfirmation: '12345678',
          };

          const response = await request(app.getHttpServer())
            .post(`/auth/sign-up`)
            .send(signUpDto)
            .expect(400);

          expect(response.body.message[0]).toEqual('name must be a string');
        });

        it('has more than 80 characters', async () => {
          const signUpDto: SignUpDto = {
            name: 'x'.repeat(81),
            email: 'valid@email.com',
            password: '12345678',
            passwordConfirmation: '12345678',
          };

          const response = await request(app.getHttpServer())
            .post(`/auth/sign-up`)
            .send(signUpDto)
            .expect(400);

          expect(response.body.message[0]).toEqual(
            'name must be shorter than or equal to 80 characters',
          );
        });
      });

      it.skip('user with the received email already exists', async () => {
        const fakeUser = makeFakeUser();
        await prismaService.user.create({
          data: fakeUser,
        });

        const signUpDto: SignUpDto = {
          name: fakeUser.name,
          email: fakeUser.email,
          password: '12345678',
          passwordConfirmation: '12345678',
        };

        const response = await request(app.getHttpServer())
          .post(`/auth/sign-up`)
          .send(signUpDto)
          .expect(409);

        expect(response.body).toEqual(`User with this email already exists`);
      });

      it('email does not have a valid format', async () => {
        const signUpDto: SignUpDto = {
          name: 'any_name',
          email: 'invalid_email',
          password: '12345678',
          passwordConfirmation: '12345678',
        };

        const response = await request(app.getHttpServer())
          .post(`/auth/sign-up`)
          .send(signUpDto)
          .expect(400);

        expect(response.body.message[0]).toEqual('email must be an email');
      });

      it('password is different from passwordConfirmation', async () => {
        const signUpDto: SignUpDto = {
          name: 'any_name',
          email: 'valid@email.com',
          password: 'any_password',
          passwordConfirmation: 'different_password',
        };

        const response = await request(app.getHttpServer())
          .post(`/auth/sign-up`)
          .send(signUpDto)
          .expect(400);

        expect(response.body.message[0]).toEqual(
          'password and passwordConfirmation does not match',
        );
      });

      it('password has less than 8 characters', async () => {
        const signUpDto: SignUpDto = {
          name: 'any_name',
          email: 'any_email@valid.com',
          password: '1234',
          passwordConfirmation: '1234',
        };

        const response = await request(app.getHttpServer())
          .post(`/auth/sign-up`)
          .send(signUpDto)
          .expect(400);

        expect(response.body.message[0]).toEqual(
          'password must be longer than or equal to 8 characters',
        );
      });
    });
  });
});
