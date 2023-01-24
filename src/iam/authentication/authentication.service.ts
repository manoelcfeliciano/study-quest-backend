import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'src/common/db/generic.repository';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import jwtConfig from '../config/jwt.config';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { randomUUID } from 'crypto';
import { UserDomain } from '../../../dist/src/users/interfaces/user.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(USERS_REPOSITORY_KEY)
    private readonly userRepo: Repository<UserEntity>,
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

  private generateTokens = async (user: UserEntity) => {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, {
        email: user.email,
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
        expiresIn: this.jwtConfiguration.refreshTokenTtl,
      },
    );
  }
}
