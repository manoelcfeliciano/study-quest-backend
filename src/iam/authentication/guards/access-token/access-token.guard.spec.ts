import { AccessTokenGuard } from './access-token.guard';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';

describe('AccessTokenGuard', () => {
  let sut: AccessTokenGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = createMock<JwtService>();
    sut = new AccessTokenGuard(jwtService, jwtConfig());
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when token is valid', async () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer valid_token',
        },
      });

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: 'valid_user_id' });

      const response = await sut.canActivate(mockContext);

      expect(response).toBe(true);
    });

    it('should return false when token is invalid', async () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer invalid_token',
        },
      });

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      const promise = sut.canActivate(mockContext);

      expect(promise).rejects.toThrow(UnauthorizedException);
    });

    it('should return false when token is not provided', async () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {},
      });

      const promise = sut.canActivate(mockContext);

      expect(promise).rejects.toThrow(UnauthorizedException);
    });

    it('should return false when token is not a bearer token', async () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'invalid_token',
        },
      });

      const promise = sut.canActivate(mockContext);

      expect(promise).rejects.toThrow(UnauthorizedException);
    });
  });
});
