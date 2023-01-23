import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { makeFakeUser } from './mocks/entities/fake-user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';
import { clear } from 'src/common/db/prisma/test.utils';
import { makeE2ETestModule } from 'src/common/test/factories/test-module-e2e.factory';

const prismaService = new PrismaService();
const userPersistenceMapper = new UserPersistenceMapper();

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await makeE2ETestModule();
  });

  afterAll(() => {
    clear('postgres');
  });

  it('/ (POST)', async () => {
    const fakeUser = makeFakeUser();
    const createUserDto = userPersistenceMapper.toInputDto(fakeUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...response } = new UserResponseDto(
      userPersistenceMapper.toResponseDto(fakeUser),
    ).toPlain();

    request(app.getHttpServer())
      .post(`/users`)
      .send(createUserDto)
      .expect(201)
      .expect({
        ...response,
        loginAttempts: 0,
      });
  });

  it('/ (PUT)', async () => {
    const user = await prismaService.user.create({
      data: makeFakeUser(),
    });
    const updateUserDto = userPersistenceMapper.toInputDto(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...response } = new UserResponseDto(
      userPersistenceMapper.toResponseDto(user),
    ).toPlain();

    request(app.getHttpServer())
      .put(`/users`)
      .send(updateUserDto)
      .expect(200)
      .expect({
        ...response,
        loginAttempts: 0,
      });
  });

  it('/{id} (GET)', async () => {
    const user = await prismaService.user.create({
      data: makeFakeUser(),
    });

    const response = new UserResponseDto(
      userPersistenceMapper.toResponseDto(user),
    );

    return request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .expect(200)
      .expect(response.toPlain());
  });

  it('/{id} (DELETE)', async () => {
    const user = await prismaService.user.create({
      data: makeFakeUser(),
    });

    return request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .expect(200)
      .expect({});
  });
});
