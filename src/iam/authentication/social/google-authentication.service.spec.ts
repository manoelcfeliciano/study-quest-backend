import { createMock } from '@golevelup/ts-jest';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'src/common/db/generic.repository';
import { OAUTH2_CLIENT_KEY } from 'src/iam/iam.constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import { makeFakeUser } from 'src/users/test/mocks/entities/fake-user.entity';
import { AuthenticationService } from '../authentication.service';
import { GoogleAuthenticationService } from './google-authentication.service';

jest.mock('google-auth-library');

describe('GoogleAuthenticationService', () => {
  let sut: GoogleAuthenticationService;
  let userRepo: Repository<UserEntity>;
  let authService: AuthenticationService;
  let configService: ConfigService;
  let oauthClient: OAuth2Client;

  beforeEach(async () => {
    userRepo = createMock<Repository<UserEntity>>();
    authService = createMock<AuthenticationService>();
    configService = createMock<ConfigService>();
    oauthClient = createMock<OAuth2Client>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthenticationService,
        { provide: ConfigService, useValue: configService },
        { provide: AuthenticationService, useValue: authService },
        { provide: USERS_REPOSITORY_KEY, useValue: userRepo },
        { provide: OAUTH2_CLIENT_KEY, useValue: oauthClient },
      ],
    }).compile();

    sut = module.get<GoogleAuthenticationService>(GoogleAuthenticationService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('authenticate', () => {
    it('should be defined', () => {
      expect(sut.authenticate).toBeDefined();
    });

    it('should call oauthClient.verifyIdToken with correct params', async () => {
      jest.spyOn(oauthClient, 'verifyIdToken');

      await sut.authenticate('token');

      expect(oauthClient.verifyIdToken).toHaveBeenCalledWith({
        idToken: 'token',
      });
    });

    it('should call userRepo.findOneBy with correct params', async () => {
      jest.spyOn(oauthClient, 'verifyIdToken').mockImplementation(() => {
        return Promise.resolve({
          getPayload: () => {
            return {
              sub: 'sub',
              name: 'name',
              email: 'email',
            };
          },
        });
      });
      const findOneBySpy = jest.spyOn(userRepo, 'findOneBy');

      await sut.authenticate('token');
      expect(findOneBySpy).toHaveBeenCalledWith({ googleId: 'sub' });
    });

    it('should create user when not already registered and return the correct response', async () => {
      const fakeUser = makeFakeUser();

      jest.spyOn(authService, 'generateTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      jest.spyOn(oauthClient, 'verifyIdToken').mockImplementation(() => {
        return Promise.resolve({
          getPayload: () => {
            return {
              sub: 'sub',
              name: 'name',
              email: 'email',
            };
          },
        });
      });
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);
      const createSpy = jest
        .spyOn(userRepo, 'create')
        .mockResolvedValue(fakeUser);

      const response = await sut.authenticate('token');

      expect(createSpy).toHaveBeenCalledWith({
        name: 'name',
        email: 'email',
        googleId: 'sub',
      });

      expect(response).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should return the correct response when user already exists', async () => {
      const fakeUser = makeFakeUser();

      jest.spyOn(authService, 'generateTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(fakeUser);

      const createSpy = jest.spyOn(userRepo, 'create');

      const response = await sut.authenticate('token');

      expect(createSpy).not.toHaveBeenCalled();

      expect(response).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw an error when oauthClient.verifyIdToken throws an error', async () => {
      const error = new UnauthorizedException();

      jest.spyOn(oauthClient, 'verifyIdToken').mockImplementation(() => error);

      const promise = sut.authenticate('token');

      await expect(promise).rejects.toThrowError(error);
    });

    it('should throw an error when userRepo.findOneBy throws an error', async () => {
      const error = new UnauthorizedException();

      jest.spyOn(oauthClient, 'verifyIdToken').mockImplementation(() => {
        return Promise.resolve({
          getPayload: () => {
            return {
              sub: 'sub',
              name: 'name',
              email: 'email',
            };
          },
        });
      });
      jest
        .spyOn(userRepo, 'findOneBy')
        .mockImplementation(() => Promise.reject(error));

      const promise = sut.authenticate('token');

      await expect(promise).rejects.toThrowError(error);
    });

    it('should throw an error when userRepo.create throws an error', async () => {
      const error = new UnauthorizedException();

      jest.spyOn(oauthClient, 'verifyIdToken').mockImplementation(() => {
        return Promise.resolve({
          getPayload: () => {
            return {
              sub: 'sub',
              name: 'name',
              email: 'email',
            };
          },
        });
      });
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepo, 'create').mockImplementation(() => {
        throw error;
      });

      const promise = sut.authenticate('token');

      await expect(promise).rejects.toThrowError(error);
    });
  });
});
