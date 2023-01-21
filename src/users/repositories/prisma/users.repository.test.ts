import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { clear } from 'src/common/db/prisma/test.utils';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { PrismaUserRepository } from './users.repository';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserPersistenceMapper } from 'src/users/mappers/user-persistence.mapper';

const prismaService = new PrismaService();
const userPersistenceMapper = new UserPersistenceMapper();

describe('PrismaUserRepository', () => {
  let sut: PrismaUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaUserRepository, UserPersistenceMapper, PrismaService],
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
      const createUserDto: CreateUserDto =
        userPersistenceMapper.toInputDto(fakeUser);

      const result = await sut.create(createUserDto);
      expect(result).toEqual(
        expect.objectContaining({
          email: fakeUser.email,
          name: fakeUser.name,
          loginAttempts: 0,
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
      const fakeUser = makeFakeUser();
      const userToUpdate = await prismaService.user.create({
        data: fakeUser,
      });
      const changePayload: UpdateUserDto = userPersistenceMapper.toInputDto(
        makeFakeUser(),
      );

      const result = await sut.update(userToUpdate.id, changePayload);

      expect(result).toEqual(
        expect.objectContaining({
          email: changePayload.email,
          name: changePayload.name,
          loginAttempts: fakeUser.loginAttempts,
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
