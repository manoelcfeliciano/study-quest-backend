import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/role.enum';
import { USER_REPOSITORY_KEY } from './repositories/prisma/user-repository.config';
import { makeFakeUser } from './test/mocks/entities/fake-user.entity';
import { UserRepository, UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let sut: UsersService;
  let userRepo: UserRepository;

  beforeEach(async () => {
    userRepo = createMock<UserRepository>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USER_REPOSITORY_KEY, useValue: userRepo },
      ],
    }).compile();

    sut = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('create()', () => {
    it('should call userRepository.create() with the correct params', async () => {
      const fakeUser = makeFakeUser();
      const createUserDto: CreateUserDto = {
        email: fakeUser.email,
        name: fakeUser.name,
        password: fakeUser.password,
        role: Role.student,
      };

      const fakeUserResponse = 'any_user';

      const userRepoSpy = jest
        .spyOn(userRepo, 'create')
        .mockResolvedValue(fakeUserResponse as any);

      const response = await sut.create(createUserDto);

      expect(userRepoSpy).toBeCalledWith(createUserDto);
      expect(response).toBe(fakeUserResponse);
    });

    it('should throw if userRepository.create() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(userRepo, 'create').mockRejectedValue(error);

      const promise = sut.create({} as any);

      expect(promise).rejects.toThrow(error);
    });
  });

  describe('update()', () => {
    it('should call userRepository.update() with the correct params', async () => {
      const userToUpdate = makeFakeUser();
      const newUser = makeFakeUser();
      const updateUserDto: UpdateUserDto = {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: Role.student,
      };

      const userRepoSpy = jest
        .spyOn(userRepo, 'update')
        .mockResolvedValue(newUser as any);

      const response = await sut.update(userToUpdate.id, updateUserDto);

      expect(userRepoSpy).toBeCalledWith(userToUpdate.id, updateUserDto);
      expect(response).toBe(newUser);
    });

    it('should throw if userRepository.update() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(userRepo, 'update').mockRejectedValue(error);

      const promise = sut.update('', {} as any);

      expect(promise).rejects.toThrow(error);
    });
  });

  describe('get()', () => {
    it('should call userRepository.findOne() with the correct params', async () => {
      const fakeUserId = 'any_user_id';
      const fakeUser = 'any_user';
      const userRepoSpy = jest
        .spyOn(userRepo, 'findOne')
        .mockResolvedValue(fakeUser as any);

      const response = await sut.get(fakeUserId);

      expect(userRepoSpy).toBeCalledWith(fakeUserId);
      expect(response).toBe(fakeUser);
    });

    it('should throw if userRepository.findOne() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(userRepo, 'findOne').mockRejectedValue(error);

      const promise = sut.get('');

      expect(promise).rejects.toThrow(error);
    });
  });

  describe('delete()', () => {
    it('should call userRepository.delete() with the correct params', async () => {
      const fakeUserId = 'any_user_id';
      const userRepoSpy = jest.spyOn(userRepo, 'delete');

      const response = await sut.delete(fakeUserId);

      expect(userRepoSpy).toBeCalledWith(fakeUserId);
      expect(response).toBe(undefined);
    });

    it('should throw if userRepository.delete() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(userRepo, 'delete').mockRejectedValue(error);

      const promise = sut.delete('');

      expect(promise).rejects.toThrow(error);
    });
  });
});
