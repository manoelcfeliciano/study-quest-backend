import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { makeFakeUser } from './mocks/entities/fake-user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';

const prismaService = new PrismaService();
const userPersistenceMapper = new UserPersistenceMapper();

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
});
