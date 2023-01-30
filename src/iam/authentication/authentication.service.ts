import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Repository } from 'src/common/db/generic.repository';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import jwtConfig from '../config/jwt.config';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { InvalidatedRefreshTokenError } from '../errors/invalidated-refresh-token.error';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokensIdsStorage } from './refresh-tokens-ids.storage';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActiveUser } from './decorators/active-user.decorator';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(USERS_REPOSITORY_KEY)
    private readonly userRepo: Repository<UserEntity>,
    private readonly refreshTokenIdsStorage: RefreshTokensIdsStorage,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password } = signUpDto;

    const hashedPassword = await this.hashingService.hash(password);

    const user = await this.userRepo.create({
      name,
      email,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepo.findOne(activeUser.sub);

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old one',
      );
    }

    const isPasswordValid = await this.hashingService.compare(
      oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = await this.hashingService.hash(newPassword);

    await this.userRepo.update(user.id, {
      password: hashedPassword,
    });

    return this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userRepo.findOne(sub);

      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh token is invalid');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }

      throw new UnauthorizedException();
    }
  }

  public generateTokens = async (user: UserEntity) => {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, {
        email: user.email,
        role: user.role,
      }),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    return { accessToken, refreshToken };
  };

  private signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: expiresIn,
      },
    );
  }
}
