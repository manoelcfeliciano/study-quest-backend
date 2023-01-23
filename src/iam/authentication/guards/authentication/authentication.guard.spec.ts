import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType } from '../../enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let sut: AuthenticationGuard;
  let accessTokenGuard: AccessTokenGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = createMock<Reflector>();
    accessTokenGuard = createMock<AccessTokenGuard>();
    sut = new AuthenticationGuard(reflector, accessTokenGuard);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when AccessTokenGuard returns true for defaultAuthType', async () => {
      const mockContext = createMock<ExecutionContext>();

      jest.spyOn(accessTokenGuard, 'canActivate').mockResolvedValue(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const response = await sut.canActivate(mockContext);

      expect(response).toBe(true);
    });

    it('should return true when AccessTokenGuard returns true for AuthType Bearer', async () => {
      const mockContext = createMock<ExecutionContext>();

      jest.spyOn(accessTokenGuard, 'canActivate').mockResolvedValue(true);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AuthType.Bearer]);

      const response = await sut.canActivate(mockContext);

      expect(response).toBe(true);
    });

    it('should throw when AccessTokenGuard returns false', async () => {
      const mockContext = createMock<ExecutionContext>();

      jest.spyOn(accessTokenGuard, 'canActivate').mockResolvedValue(false);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const promise = sut.canActivate(mockContext);

      expect(promise).rejects.toThrow(UnauthorizedException);
    });

    it('should return true when AuthType is NONE', async () => {
      const mockContext = createMock<ExecutionContext>();

      jest.spyOn(accessTokenGuard, 'canActivate').mockResolvedValue(false);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AuthType.None]);

      const response = await sut.canActivate(mockContext);

      expect(response).toBe(true);
    });
  });
});
