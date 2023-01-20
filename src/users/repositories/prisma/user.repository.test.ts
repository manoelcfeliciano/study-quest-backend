import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { clear } from 'src/common/db/prisma/test.utils';
import { UserEntity } from 'src/users/entities/user.entity';
import { PrismaUserMapper } from 'src/users/mappers/prisma/user.mapper';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { PrismaUserRepository } from './user.repository';

const prismaService = new PrismaService();

describe('PrismaUserRepository', () => {
  let sut: PrismaUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaUserRepository, PrismaUserMapper, PrismaService],
    }).compile();

    sut = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  afterAll(() => {
    clear('postgres');
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('create()', () => {
    it('should create a user properly and return response as domain object', async () => {
      const fakeUser = makeFakeUser();
      const result = await sut.create(fakeUser);
      expect(result).toEqual(
        expect.objectContaining({
          email: fakeUser.email,
          name: fakeUser.name,
          loginAttempts: fakeUser.loginAttempts,
          password: fakeUser.password,
          role: fakeUser.role,
        }),
      );
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('update()', () => {
    it('should update a user properly and return response as domain object', async () => {
      const userToUpdate = await prismaService.user.create({
        data: makeFakeUser(),
      });
      const changePayload: Partial<UserEntity> = makeFakeUser();

      const result = await sut.update(userToUpdate.id, changePayload);

      expect(result).toEqual(
        expect.objectContaining({
          email: changePayload.email,
          name: changePayload.name,
          loginAttempts: changePayload.loginAttempts,
          password: changePayload.password,
          role: changePayload.role,
        }),
      );
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('delete()', () => {
    it('should delete a user properly', async () => {
      const userToDelete = await prismaService.user.create({
        data: makeFakeUser(),
      });

      const result = await sut.delete(userToDelete.id);

      const deletedUser = await prismaService.user.findUnique({
        where: { id: userToDelete.id },
      });

      expect(result).toEqual(undefined);
      expect(deletedUser).toEqual(null);
    });
  });

  describe('findOne()', () => {
    it('should return the user with the received id properly', async () => {
      const user = await prismaService.user.create({
        data: makeFakeUser(),
      });

      const result = await sut.findOne(user.id);

      expect(result).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          name: user.name,
          loginAttempts: user.loginAttempts,
          password: user.password,
          role: user.role,
        }),
      );
    });
  });

  describe('findOneBy()', () => {
    it('should return the user with the received options properly', async () => {
      const user = await prismaService.user.create({
        data: makeFakeUser(),
      });

      const result = await sut.findOneBy({
        email: user.email,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          name: user.name,
          loginAttempts: user.loginAttempts,
          password: user.password,
          role: user.role,
        }),
      );
    });
  });
});
