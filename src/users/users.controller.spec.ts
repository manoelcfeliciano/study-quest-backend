import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';
import { makeFakeUser } from './test/mocks/entities/fake-user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let sut: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    sut = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('create()', () => {
    it('should call userService.create() with the correct params', async () => {
      const fakeUser = makeFakeUser();
      const createUserDto: CreateUserDto = {
        email: fakeUser.email,
        name: fakeUser.name,
        password: fakeUser.password,
        role: Role.student,
      };

      const fakeUserResponse = 'any_user';

      const userServiceSpy = jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(fakeUserResponse as any);

      const response = await sut.create(createUserDto);

      expect(userServiceSpy).toBeCalledWith(createUserDto);
      expect(response).toBe(fakeUserResponse);
    });

    it('should throw if userService.create() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(usersService, 'create').mockRejectedValue(error);

      const promise = sut.create({} as any);

      expect(promise).rejects.toThrow(error);
    });
  });

  describe('update()', () => {
    it('should call usersService.update() with the correct params', async () => {
      const userToUpdate = makeFakeUser();
      const newUser = makeFakeUser();
      const updateUserDto: UpdateUserDto = {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: Role.student,
      };

      const usersServiceSpy = jest
        .spyOn(usersService, 'update')
        .mockResolvedValue(newUser as any);

      const response = await sut.update(userToUpdate.id, updateUserDto);

      expect(usersServiceSpy).toBeCalledWith(userToUpdate.id, updateUserDto);
      expect(response).toBe(newUser);
    });

    it('should throw if usersService.update() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(usersService, 'update').mockRejectedValue(error);

      const promise = sut.update('', {} as any);

      expect(promise).rejects.toThrow(error);
    });
  });

  describe('get()', () => {
    it('should call usersService.get() with the correct params', async () => {
      const fakeUserId = 'any_user_id';
      const fakeUser = 'any_user';
      const usersServiceSpy = jest
        .spyOn(usersService, 'get')
        .mockResolvedValue(fakeUser as any);

      const response = await sut.get(fakeUserId);

      expect(usersServiceSpy).toBeCalledWith(fakeUserId);
      expect(response).toBe(fakeUser);
    });

    it('should throw if usersService.get() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(usersService, 'get').mockRejectedValue(error);

      const promise = sut.get('');

      expect(promise).rejects.toThrow(error);
    });
  });

  describe('delete()', () => {
    it('should call usersServiceSpy.delete() with the correct params', async () => {
      const fakeUserId = 'any_user_id';
      const usersServiceSpy = jest.spyOn(usersService, 'delete');

      const response = await sut.delete(fakeUserId);

      expect(usersServiceSpy).toBeCalledWith(fakeUserId);
      expect(response).toBe(undefined);
    });

    it('should throw if usersServiceSpy.delete() throws', async () => {
      const error = new Error('any_error');

      jest.spyOn(usersService, 'delete').mockRejectedValue(error);

      const promise = sut.delete('');

      expect(promise).rejects.toThrow(error);
    });
  });
});
