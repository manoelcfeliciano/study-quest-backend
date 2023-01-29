import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'src/common/db/generic.repository';
import { UserEntity } from 'src/users/entities/user.entity';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { HashingService } from '../../common/hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokensIdsStorage } from './refresh-tokens-ids.storage';
import jwtConfig from '../config/jwt.config';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserPersistenceMapper } from '../../users/mappers/user-persistence.mapper';
import { randomUUID } from 'crypto';

const makeRequestInput = () => {
  const fakeAccessToken = 'some-access-token';
  const fakeRefreshToken = 'some-refresh-token';
  const fakeUser = makeFakeUser();
  const signInDto: SignInDto = {
    email: fakeUser.email,
    password: fakeUser.password,
  };
  const signUpDto: SignUpDto = {
    name: fakeUser.name,
    email: fakeUser.email,
    password: fakeUser.password,
    passwordConfirmation: fakeUser.password,
  };
  const changePasswordDto: ChangePasswordDto = {
    oldPassword: fakeUser.password,
    newPassword: 'new-password',
  };

  const userPersistenceMapper = new UserPersistenceMapper();
  const userInputDto = userPersistenceMapper.toInputDto(fakeUser);
  const activeUser = {
    email: userInputDto.email,
    role: userInputDto.role,
    sub: randomUUID(),
  };

  return {
    signUpDto,
    signInDto,
    changePasswordDto,
    fakeUser,
    activeUser,
    fakeAccessToken,
    fakeRefreshToken,
  };
};

describe('AuthenticationService', () => {
  let sut: AuthenticationService;
  let userRepo: Repository<UserEntity>;
  let jwtService: JwtService;
  let hashingService: HashingService;
  let refreshTokensIdsStorage: RefreshTokensIdsStorage;

  beforeEach(async () => {
    userRepo = createMock<Repository<UserEntity>>();
    jwtService = createMock<JwtService>();
    hashingService = createMock<HashingService>();
    refreshTokensIdsStorage = createMock<RefreshTokensIdsStorage>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
      ],
      providers: [
        { provide: HashingService, useValue: hashingService },
        { provide: USERS_REPOSITORY_KEY, useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: RefreshTokensIdsStorage, useValue: refreshTokensIdsStorage },
        AuthenticationService,
      ],
    }).compile();

    sut = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('signIn()', () => {
    it('should return the access token properly', async () => {
      const { signInDto, fakeAccessToken, fakeRefreshToken, fakeUser } =
        makeRequestInput();

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce(fakeAccessToken)
        .mockResolvedValueOnce(fakeRefreshToken);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(fakeUser);

      const response = await sut.signIn(signInDto);

      expect(response).toStrictEqual({
        accessToken: fakeAccessToken,
        refreshToken: fakeRefreshToken,
      });
    });

    it('should throw an error if the user is not found', async () => {
      const { signInDto } = makeRequestInput();

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);

      await expect(sut.signIn(signInDto)).rejects.toThrowError(
        new UnauthorizedException('User not found'),
      );
    });

    it('should throw an error if the password is not valid', async () => {
      const { signInDto, fakeUser } = makeRequestInput();

      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(fakeUser);

      await expect(sut.signIn(signInDto)).rejects.toThrowError(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('should throw an error if the hashingService.compare() throws', async () => {
      const { signInDto, fakeUser } = makeRequestInput();
      const error = new Error();

      jest.spyOn(hashingService, 'compare').mockRejectedValue(error);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(fakeUser);

      await expect(sut.signIn(signInDto)).rejects.toThrowError(error);
    });

    it('should throw an error if the jwtService.signAsync() throws', async () => {
      const { signInDto, fakeUser } = makeRequestInput();
      const error = new Error();

      jest.spyOn(jwtService, 'signAsync').mockRejectedValue(error);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(fakeUser);

      await expect(sut.signIn(signInDto)).rejects.toThrowError(error);
    });
  });

  describe('signUp()', () => {
    it('should call hashingService.hash() with the correct params', async () => {
      const { signUpDto } = makeRequestInput();
      const hashSpy = jest.spyOn(hashingService, 'hash');

      await sut.signUp(signUpDto);

      expect(hashSpy).toHaveBeenCalledWith(signUpDto.password);
    });

    it('should call userRepository.create() with the correct params', async () => {
      const { signUpDto, fakeAccessToken } = makeRequestInput();

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(fakeAccessToken);
      jest.spyOn(hashingService, 'hash').mockResolvedValue('hashed-password');
      const userRepoCreateSpy = jest.spyOn(userRepo, 'create');

      await sut.signUp(signUpDto);

      expect(userRepoCreateSpy).toHaveBeenCalledWith({
        name: signUpDto.name,
        email: signUpDto.email,
        password: 'hashed-password',
      });
    });

    it('should return the access token properly', async () => {
      const { signUpDto, fakeAccessToken, fakeRefreshToken, fakeUser } =
        makeRequestInput();

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce(fakeAccessToken)
        .mockResolvedValueOnce(fakeRefreshToken);
      jest.spyOn(userRepo, 'create').mockResolvedValue(fakeUser);

      const response = await sut.signUp(signUpDto);

      expect(response).toStrictEqual({
        accessToken: fakeAccessToken,
        refreshToken: fakeRefreshToken,
      });
    });

    it('should calljwtService.signAsync() with correct params', async () => {
      const { signUpDto, fakeUser } = makeRequestInput();
      const jwtConfiguration = jwtConfig();

      jest.spyOn(hashingService, 'hash').mockResolvedValue('hashed-password');
      jest
        .spyOn(userRepo, 'create')
        .mockResolvedValue({ id: 'valid-id', ...fakeUser });
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      await sut.signUp(signUpDto);

      expect(signAsyncSpy).toHaveBeenCalledWith(
        {
          sub: 'valid-id',
          email: fakeUser.email,
          role: fakeUser.role,
        },
        {
          audience: jwtConfiguration.audience,
          expiresIn: jwtConfiguration.accessTokenTtl,
          issuer: jwtConfiguration.issuer,
          secret: jwtConfiguration.secret,
        },
      );

      expect(signAsyncSpy).toHaveBeenLastCalledWith(
        {
          sub: 'valid-id',
          refreshTokenId: expect.any(String),
        },
        {
          audience: jwtConfiguration.audience,
          expiresIn: jwtConfiguration.refreshTokenTtl,
          issuer: jwtConfiguration.issuer,
          secret: jwtConfiguration.secret,
        },
      );
    });

    it('should throw if hashingService.hash() throws', async () => {
      const { signUpDto } = makeRequestInput();

      const error = new Error();

      jest.spyOn(hashingService, 'hash').mockRejectedValue(error);

      await expect(sut.signUp(signUpDto)).rejects.toThrow(error);
    });

    it('should throw if userRepository.create() throws', async () => {
      const { signUpDto } = makeRequestInput();
      const error = new Error();

      jest.spyOn(hashingService, 'hash').mockResolvedValue('hashed-password');
      jest.spyOn(userRepo, 'create').mockRejectedValue(error);

      await expect(sut.signUp(signUpDto)).rejects.toThrow(error);
    });

    it('should throw if jwtService.signAsync() throws', async () => {
      const { signUpDto, fakeUser } = makeRequestInput();
      const error = new Error();

      jest.spyOn(hashingService, 'hash').mockResolvedValue('hashed-password');
      jest.spyOn(userRepo, 'create').mockResolvedValue(fakeUser);
      jest.spyOn(jwtService, 'signAsync').mockRejectedValue(error);

      await expect(sut.signUp(signUpDto)).rejects.toThrow(error);
    });
  });

  describe('changePassword()', () => {
    it('should call hashingService.compare() with the correct params', async () => {
      const { changePasswordDto, activeUser, fakeUser } = makeRequestInput();
      const compareSpy = jest.spyOn(hashingService, 'compare');

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(fakeUser);

      await sut.changePassword(changePasswordDto, {
        email: activeUser.email,
        role: activeUser.role,
        sub: fakeUser.id,
      });

      expect(compareSpy).toHaveBeenCalledWith(
        changePasswordDto.oldPassword,
        hashingService.hash(fakeUser.password),
      );
    });

    it('should change password properly if the current password is correct', async () => {
      const { changePasswordDto, activeUser, fakeUser } = makeRequestInput();

      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(fakeUser);
      const updateSpy = jest.spyOn(userRepo, 'update');

      await sut.changePassword(changePasswordDto, activeUser);

      expect(updateSpy).toHaveBeenCalledWith(fakeUser.id, {
        password: changePasswordDto.newPassword,
      });
    });

    it('should throw if the current password is incorrect', async () => {
      const { changePasswordDto, activeUser } = makeRequestInput();

      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      await expect(
        sut.changePassword(changePasswordDto, activeUser),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });
});
