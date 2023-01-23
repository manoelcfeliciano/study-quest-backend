import { Test, TestingModule } from '@nestjs/testing';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { createMock } from '@golevelup/ts-jest';

const makeRequestInput = () => {
  const fakeUser = makeFakeUser();
  const signUpDto: SignUpDto = {
    email: fakeUser.email,
    password: fakeUser.password,
    name: fakeUser.name,
    passwordConfirmation: fakeUser.password,
  };

  return { signUpDto, fakeUser };
};

describe('AuthenticationController', () => {
  let sut: AuthenticationController;
  let authService: AuthenticationService;

  beforeEach(async () => {
    authService = createMock<AuthenticationService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [{ provide: AuthenticationService, useValue: authService }],
    }).compile();

    sut = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
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
      });

      const response = await sut.signUp(signUpDto);

      expect(response).toStrictEqual({
        accessToken: 'any_access_token',
      });
    });

    it('should throw if authService.signUp() throws', async () => {
      const { signUpDto } = makeRequestInput();

      const error = new Error();

      jest.spyOn(authService, 'signUp').mockRejectedValue(error);

      await expect(sut.signUp(signUpDto)).rejects.toThrow(error);
    });
  });
});
