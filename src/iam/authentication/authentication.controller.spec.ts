import { Test, TestingModule } from '@nestjs/testing';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { createMock } from '@golevelup/ts-jest';
import { RefreshTokensIdsStorage } from './refresh-tokens-ids.storage';
import { RedisModule } from 'src/common/db/redis/redis.module';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserPersistenceMapper } from 'src/users/mappers/user-persistence.mapper';
import { randomUUID } from 'crypto';

const makeRequestInput = () => {
  const fakeUser = makeFakeUser();
  const signInDto: SignInDto = {
    email: fakeUser.email,
    password: fakeUser.password,
  };
  const signUpDto: SignUpDto = {
    email: fakeUser.email,
    password: fakeUser.password,
    name: fakeUser.name,
    passwordConfirmation: fakeUser.password,
  };
  const changePasswordDto: ChangePasswordDto = {
    oldPassword: fakeUser.password,
    newPassword: fakeUser.password,
  };

  const userPersistenceMapper = new UserPersistenceMapper();
  const userInputDto = userPersistenceMapper.toInputDto(fakeUser);
  const activeUser = {
    email: userInputDto.email,
    role: userInputDto.role,
    sub: randomUUID(),
  };

  return { signUpDto, signInDto, changePasswordDto, fakeUser, activeUser };
};

describe('AuthenticationController', () => {
  let sut: AuthenticationController;
  let authService: AuthenticationService;

  beforeEach(async () => {
    authService = createMock<AuthenticationService>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
      controllers: [AuthenticationController],
      providers: [
        { provide: AuthenticationService, useValue: authService },
        RefreshTokensIdsStorage,
      ],
    }).compile();

    sut = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('signIn()', () => {
    it('should call authService.signIn() with the correct params', async () => {
      const { signInDto } = makeRequestInput();

      const signInSpy = jest.spyOn(authService, 'signIn');

      await sut.signIn(signInDto);

      expect(signInSpy).toHaveBeenCalledWith(signInDto);
    });

    it('should return the correct response', async () => {
      const { signInDto } = makeRequestInput();

      jest.spyOn(authService, 'signIn').mockResolvedValue({
        accessToken: 'any_access_token',
        refreshToken: 'any_refresh_token',
      });

      const response = await sut.signIn(signInDto);

      expect(response).toStrictEqual({
        accessToken: 'any_access_token',
        refreshToken: 'any_refresh_token',
      });
    });
  });

  describe('signUp()', () => {
    it('should call authService.signUp() with the correct params', async () => {
      const { signUpDto } = makeRequestInput();

      const signUpSpy = jest.spyOn(authService, 'signUp');

      await sut.signUp(signUpDto);

      expect(signUpSpy).toHaveBeenCalledWith(signUpDto);
    });

    it('should return the correct response', async () => {
      const { signUpDto } = makeRequestInput();

      jest.spyOn(authService, 'signUp').mockResolvedValue({
        accessToken: 'any_access_token',
        refreshToken: 'any_refresh_token',
      });

      const response = await sut.signUp(signUpDto);

      expect(response).toStrictEqual({
        accessToken: 'any_access_token',
        refreshToken: 'any_refresh_token',
      });
    });

    it('should throw if authService.signUp() throws', async () => {
      const { signUpDto } = makeRequestInput();

      const error = new Error();

      jest.spyOn(authService, 'signUp').mockRejectedValue(error);

      await expect(sut.signUp(signUpDto)).rejects.toThrow(error);
    });
  });

  describe('changePassword()', () => {
    it('should call authService.changePassword() with the correct params', async () => {
      const { changePasswordDto, activeUser } = makeRequestInput();

      const changePasswordSpy = jest.spyOn(authService, 'changePassword');

      await sut.changePassword(changePasswordDto, activeUser);

      expect(changePasswordSpy).toHaveBeenCalledWith(
        changePasswordDto,
        activeUser,
      );
    });

    it('should return the correct response', async () => {
      const { changePasswordDto, activeUser } = makeRequestInput();

      jest.spyOn(authService, 'changePassword').mockResolvedValue({
        accessToken: 'any_access_token',
        refreshToken: 'any_refresh_token',
      });

      const response = await sut.changePassword(changePasswordDto, activeUser);

      expect(response).toStrictEqual({
        accessToken: 'any_access_token',
        refreshToken: 'any_refresh_token',
      });
    });
  });
});
