import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { makeFakeUser } from './mocks/entities/fake-user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';
import { clear } from 'src/common/db/prisma/test.utils';
import { makeE2ETestModule } from 'src/common/test/factories/test-module-e2e.factory';
import { makeAuthenticate } from 'src/common/test/factories/authenticate.factory';

const prismaService = new PrismaService();
const userPersistenceMapper = new UserPersistenceMapper();
const auth = makeAuthenticate();

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await makeE2ETestModule();
    await app.init();
  });

  afterAll(async () => {
    await clear('postgres');
  });

  it('/ (POST)', async () => {
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

  it('/{id} (PUT)', async () => {
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

  it('/{id} (GET)', async () => {
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

  it('/{id} (DELETE)', async () => {
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
});
