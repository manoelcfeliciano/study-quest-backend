import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { makeFakeUser } from './mocks/entities/fake-user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';
import { clear } from 'src/common/db/prisma/test.utils';
import { makeE2ETestModule } from 'src/common/test/factories/test-module-e2e.factory';
import { Authenticate } from 'src/common/test/helpers/authenticate';

const prismaService = new PrismaService();
const userPersistenceMapper = new UserPersistenceMapper();

describe('Users (e2e)', () => {
  let app: INestApplication;
  let auth: Authenticate;

  beforeAll(async () => {
    const testModule = await makeE2ETestModule();
    app = testModule.app;
    auth = testModule.auth;
    await app.init();
  });

  afterAll(async () => {
    await clear('postgres');
  });

  describe('/ (POST)', () => {
    it('should return 201 when user creation is successful', async () => {
      const fakeUser = makeFakeUser();
      const createUserDto = userPersistenceMapper.toInputDto(fakeUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...response } = new UserResponseDto(
        userPersistenceMapper.toResponseDto(fakeUser),
      ).toPlain();

      const { accessToken } = await auth.handle(app);

      await request(app.getHttpServer())
        .post(`/users`)
        .send(createUserDto)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              ...response,
              loginAttempts: 0,
            }),
          ),
        );
    });

    it('should return 401 when user is not authorized', async () => {
      const fakeUser = makeFakeUser();
      const createUserDto = userPersistenceMapper.toInputDto(fakeUser);

      await request(app.getHttpServer())
        .post(`/users`)
        .send(createUserDto)
        .expect(401);
    });
  });

  describe('/{id} (PUT)', () => {
    it('should return 200 when user update is successful', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { loginAttempts, ...createUserPayload } = makeFakeUser();
      const user = await prismaService.user.create({
        data: createUserPayload,
      });
      const updateUserDto = userPersistenceMapper.toInputDto(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...response } = new UserResponseDto(
        userPersistenceMapper.toResponseDto(user),
      ).toPlain();

      const { accessToken } = await auth.handle(app);

      await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send(updateUserDto)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              ...response,
              loginAttempts: 0,
            }),
          ),
        );
    });

    it('should return 401 when user is not authorized', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { loginAttempts, ...createUserPayload } = makeFakeUser();
      const user = await prismaService.user.create({
        data: createUserPayload,
      });
      const updateUserDto = userPersistenceMapper.toInputDto(user);

      await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send(updateUserDto)
        .expect(401);
    });
  });

  describe('/{id} (GET)', () => {
    it('should return 200 when user is found', async () => {
      const user = await prismaService.user.create({
        data: makeFakeUser(),
      });

      const response = new UserResponseDto(
        userPersistenceMapper.toResponseDto(user),
      );

      const { accessToken } = await auth.handle(app);

      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(response.toPlain());
    });

    it('should return 401 when user is not authorized', async () => {
      const user = await prismaService.user.create({
        data: makeFakeUser(),
      });

      return request(app.getHttpServer()).get(`/users/${user.id}`).expect(401);
    });
  });

  describe('/{id} (DELETE)', () => {
    it('should return 200 when user is deleted', async () => {
      const user = await prismaService.user.create({
        data: makeFakeUser(),
      });

      const { accessToken } = await auth.handle(app);

      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect({});
    });

    it('should return 401 when user is not authorized', async () => {
      const user = await prismaService.user.create({
        data: makeFakeUser(),
      });

      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(401);
    });
  });
});
