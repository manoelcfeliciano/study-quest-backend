import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'src/common/db/generic.repository';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { USERS_REPOSITORY_KEY } from 'src/users/repositories/prisma/users-repository.config';
import jwtConfig from '../config/jwt.config';
import { SignUpDto } from './dto/sign-up.dto';

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

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password } = signUpDto;

    const hashedPassword = await this.hashingService.hash(password);

    const user = await this.userRepo.create({
      name,
      email,
      password: hashedPassword,
    });

    const { accessToken } = await this.generateTokens(user.id);

    return {
      accessToken,
    };
  }

  private generateTokens = async (userId: string) => {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.refreshTokenTtl,
      },
    );

    return { accessToken };
  };
}
