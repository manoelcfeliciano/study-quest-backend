import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/users/enums/role.enum';
import { RolesGuard } from './roles.guard';
import { ActiveUserData } from '../../../interfaces/active-user-data.interface';

describe('RolesGuard', () => {
  let sut: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = createMock<Reflector>();
    sut = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return true when context roles is undefined', () => {
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue([]);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const response = sut.canActivate(mockContext);

    expect(response).toBe(true);
  });

  it('should return true when user has one of the roles in context roles', () => {
    const mockContext = createMock<ExecutionContext>();

    const fakeActiveUser: ActiveUserData = {
      sub: 'fake-sub',
      email: 'fake-email',
      role: Role.student,
    };

    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: fakeActiveUser,
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.student]);

    const response = sut.canActivate(mockContext);

    expect(response).toBe(true);
  });

  it('should return false when user does not have one of the roles in context roles', () => {
    const mockContext = createMock<ExecutionContext>();

    const fakeActiveUser: ActiveUserData = {
      sub: 'fake-sub',
      email: 'fake-email',
      role: Role.student,
    };

    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: fakeActiveUser,
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.teacher]);

    const response = sut.canActivate(mockContext);

    expect(response).toBe(false);
  });
});
