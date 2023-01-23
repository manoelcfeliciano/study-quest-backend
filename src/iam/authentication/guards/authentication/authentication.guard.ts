import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';
import { AuthType } from '../../enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static defaultAuthType: AuthType = AuthType.Bearer;
  private readonly authTypeGuardMap: Record<AuthType, CanActivate> = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    let error = new UnauthorizedException();

    const guards = authTypes.map((authType) => this.authTypeGuardMap[authType]);

    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);

        if (canActivate) {
          return true;
        }
      } catch (err) {
        error = err;
      }
    }

    throw error;
  }
}
