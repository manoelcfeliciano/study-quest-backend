import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SignUpDto } from '../authentication/dto/sign-up.dto';
import { clear } from 'src/common/db/prisma/test.utils';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { makeE2ETestModule } from 'src/common/test/factories/test-module-e2e.factory';
import { BcryptService } from 'src/common/hashing/adapters/bcrypt/bcrypt.service';
import { SignInDto } from '../authentication/dto/sign-in.dto';
import { ChangePasswordDto } from '../authentication/dto/change-password.dto';
import { Authenticate } from 'src/common/test/helpers/authenticate';
import { SocialSignInDto } from '../authentication/dto/social-sign-in.dto';

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: class Mock {
      verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue({
          sub: 'any_id',
          name: 'any_name',
          email: 'any@email.com',
        }),
      });
    },
  };
});

const prismaService = new PrismaService();
const hashingService = new BcryptService();

const PASSWORD_MIN_LENGTH = 8;

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let auth: Authenticate;

  beforeAll(async () => {
    const testModule = await makeE2ETestModule();
    app = testModule.app;
    auth = testModule.auth;
    await app.init();
  });

  afterEach(async () => {
    await clear('postgres');
  });

  describe('/auth/sign-in (POST)', () => {
    it('should return 200 when sign in is successful', async () => {
      const fakeUser = makeFakeUser();
      await prismaService.user.create({
        data: {
          ...fakeUser,
          password: await hashingService.hash(fakeUser.password),
        },
      });

      const signInDto = {
        email: fakeUser.email,
        password: fakeUser.password,
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/sign-in`)
        .send(signInDto)
        .expect(200);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should return 401 when user is not found', async () => {
      const signInDto = {
        email: 'non_existent@user.com',
        password: 'any_password',
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/sign-in`)
        .send(signInDto)
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'User not found',
        statusCode: 401,
      });
    });

    it('should return 401 when password is not correct', async () => {
      const fakeUser = makeFakeUser();
      await prismaService.user.create({
        data: {
          ...fakeUser,
          password: await hashingService.hash(fakeUser.password),
        },
      });

      const signInDto: SignInDto = {
        email: fakeUser.email,
        password: 'wrong_password',
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/sign-in`)
        .send(signInDto)
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Invalid credentials',
        statusCode: 401,
      });
    });

    describe('should return 400 when', () => {
      describe('email', () => {
        it('is not a string', async () => {
          const signInDto: SignInDto = {
            email: 'invalid_email',
            password: '12345678',
          };

          const response = await request(app.getHttpServer())
            .post(`/auth/sign-in`)
            .send(signInDto)
            .expect(400);

          expect(response.body.message[0]).toEqual('email must be an email');
        });
      });

      describe('password', () => {
        it(`have less than ${PASSWORD_MIN_LENGTH} characters`, async () => {
          const signInDto: SignInDto = {
            email: 'valid@email.com',
            password: '123',
          };

          const response = await request(app.getHttpServer())
            .post(`/auth/sign-in`)
            .send(signInDto)
            .expect(400);

          expect(response.body.message[0]).toEqual(
            `password must be longer than or equal to ${PASSWORD_MIN_LENGTH} characters`,
          );
        });
      });
    });
  });

  describe('/auth/change-password (POST)', () => {
    it('should return 200 when change password is successful', async () => {
      const { accessToken, authUser } = await auth.handle(app);

      const changePasswordDto: ChangePasswordDto = {
        oldPassword: authUser.password,
        newPassword: 'new_password',
      };
      const response = await request(app.getHttpServer())
        .post(`/auth/change-password`)
        .send(changePasswordDto)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'old_password',
        newPassword: 'new_password',
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/change-password`)
        .send(changePasswordDto)
        .expect(401);

      expect(response.body).toEqual({
        message: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should return 401 when password is not correct', async () => {
      const { accessToken } = await auth.handle(app);

      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'wrong_password',
        newPassword: 'new_password',
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/change-password`)
        .send(changePasswordDto)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized',
        message: 'Invalid credentials',
        statusCode: 401,
      });
    });

    describe('should return 400 when', () => {
      describe('newPassword', () => {
        it(`have less than ${PASSWORD_MIN_LENGTH} characters`, async () => {
          const { accessToken, authUser } = await auth.handle(app);
          const changePassword: ChangePasswordDto = {
            oldPassword: authUser.password,
            newPassword: '1234',
          };

          const response = await request(app.getHttpServer())
            .post(`/auth/change-password`)
            .send(changePassword)
            .set('authorization', `Bearer ${accessToken}`)
            .expect(400);

          expect(response.body.message[0]).toEqual(
            `newPassword must be longer than or equal to ${PASSWORD_MIN_LENGTH} characters`,
          );
        });
      });
    });
  });

  describe('/auth/sign-up (POST)', () => {
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
        refreshToken: expect.any(String),
      });
    });

    it('should return 409 when sign up is unsuccessful', async () => {
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

  describe('/auth/google (POST)', () => {
    it('should return 201 when sign up is successful', async () => {
      const socialSignInDto: SocialSignInDto = {
        accessToken: 'valid_access_token',
      };

      const response = await request(app.getHttpServer())
        .post(`/auth/google`)
        .send(socialSignInDto)
        .expect(201);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    describe('should return 400 when', () => {
      describe('accessToken', () => {
        it('is empty', async () => {
          const socialSignInDto: SocialSignInDto = {
            accessToken: '',
          };

          const response = await request(app.getHttpServer())
            .post(`/auth/google`)
            .send(socialSignInDto)
            .expect(400);

          expect(response.body.message[0]).toEqual(
            'accessToken should not be empty',
          );
        });
      });
    });
  });
});
